
const fs = require('fs');
const path = require('path');
const flowParser = require('flow-parser');
// const projInfo = JSON.parse(fs.readFileSync(path.join(__dirname, './lib/projInfo.js')));
// let rootPath = path.dirname(projInfo.reactEntry);
// let fileName = path.basename(projInfo.reactEntry);
function getClassEntry(obj) {
  let entry = null;
  for (let elem of obj.body) {
    // Start lookup if Program body has ClassDeclaration or inside ExportDefaultDeclaration has ClassDeclaration
    if (elem.type === 'ClassDeclaration') {
      entry = elem.body;
      break;
    }
    else if (elem.type === 'ExportDefaultDeclaration' && elem.declaration.type === 'ClassDeclaration') {
      entry = elem.declaration.body;
      break;
    }
  }
  return entry;
}
function grabStateProps(obj) {
  let ret = [];
  let entry = getClassEntry(obj);
  if (entry)
    ret = digStateInClassBody(entry);

  return ret;
}

function digStateInClassBody(obj) {
  if (obj.type !== 'ClassBody')
    return;
  let ret = [];
  obj.body.forEach((elem) => {
    if (elem.type = "MethodDefinition" && elem.key.name === "constructor") {
      ret = digStateInBlockStatement(elem.value.body);
    }
  });
  return ret;
}

function digStateInBlockStatement(obj) {
  if (obj.type !== 'BlockStatement')
    return;
  let ret = [];
  obj.body.forEach((elem) => {
    if (elem.type === "ExpressionStatement" && elem.expression.type === "AssignmentExpression")
      if (elem.expression.left.property.name === 'state') {
        if (elem.expression.right.type === "ObjectExpression")
          return elem.expression.right.properties.forEach(elem => {
            ret.push(elem.key.name);
            return ret;
          });
      }
  });
  return ret;
 }

const grabAttr = (arrOfAttr) => {
  return arrOfAttr.reduce((acc, curr) => {
    if (curr.value.type === 'JSXExpressionContainer') {
      if (curr.value.expression.type === 'ArrowFunctionExpression' || curr.value.expression.type === 'FunctionExpression') {
        if(curr.value.expression.body.body) {
          acc[curr.name.name] = curr.value.expression.body.body[0].expression.callee.name
        } else {
          acc[curr.name.name] = curr.value.expression.body.callee.name
        }
      } else if (curr.value.expression.type === 'Literal') {
          acc[curr.name.name] = curr.value.expression.value;
      } else if (curr.value.expression.type === 'MemberExpression') {
          acc[curr.name.name] = curr.value.expression.property.name;
      } else if (curr.value.expression.type === 'ConditionalExpression') {
        let condition, consequent, alternate;
          if(curr.value.expression.test.type === 'MemberExpression') {
            condition = curr.value.expression.test.property.name;
          } else{
            condition = curr.value.expression.test.name;
          }
          if(curr.value.expression.consequent.type === 'MemberExpression') {
            consequent = curr.value.expression.consequent.property.name;
          } else{
            consequent = curr.value.expression.consequent.name;
          }
          if(curr.value.expression.alternate.type === 'MemberExpression') {
            alternate = curr.value.expression.alternate.property.name;
          } else{
            alternate = curr.value.expression.consequent.name;
          }
          acc[curr.name.name + 'True'] = {condition: condition, value:consequent};

          acc[curr.name.name + 'False'] = {condition: condition, value: alternate}
      } else {
          acc[curr.name.name] = curr.value.expression.name;
      }
    } else {
      acc[curr.name.name] = curr.value.value;
    }
    return acc;
  },{})
};

//FIX FOR REDUX
const importNamePath = (json) => {
  let output;
  const importObjectArr = json.body.filter((importObj) => {
    if (importObj.type === 'ImportDeclaration') {
      return {
        importObj
      }
    }
  })
  output = importObjectArr.map((importObj) => {
    return {
      name: importObj.specifiers[0].local.name,
      path: importObj.source.value,
    }
  })
  return output;
}

// outer function that initializes object and initial check for first opening element.
const constructComponentProps = (returnObj) => {
  const output = {};
  output[returnObj.openingElement.name.name] = grabAttr(returnObj.openingElement.attributes)
  return output;
}

// TODO:
// check for ternanry props,

function constructSingleLevel(jsxPath) {
  let reactObj = {};
  const fileContent = fs.readFileSync(jsxPath, { encoding: 'utf-8' });
  let jsonObj = flowParser.parse(fileContent);
  let imports = importNamePath(jsonObj);
  let state = grabStateProps(jsonObj);
  let componentTags = grabChildComponents(imports, fileContent);
  if (componentTags !== null){
    componentTags.forEach(elem => {
      let ast = flowParser.parse(elem).body[0].expression
      reactObj = Object.assign(reactObj, constructComponentProps(ast));
    });
    imports = imports.filter(comp => {
      comp.props = reactObj[comp.name]
      return Object.keys(reactObj).includes(comp.name);
    });
  } else{
    imports = {};
  }

  let outputObj = {
    name: path.basename(jsxPath).split('.')[0],
    childProps: imports,
    stateProps: state,
    children: []
  }
  return outputObj;
}

function constructComponentTree(filePath, rootPath = '') {
  let result = constructSingleLevel(path.join(rootPath, filePath));
  if(result && Object.keys(result.childProps).length > 0){
    for(let childProp of result.childProps) {
      let fullPath = path.join(rootPath, childProp.path);
      let newRootPath = path.dirname(fullPath);
      let newFileName = path.basename(fullPath);
  
      let childPathSplit = newFileName.split('.');
      if (childPathSplit.length === 1)
        newFileName += '.js';
      let newFullPath = path.join(newRootPath, newFileName);
      result.children.push(constructComponentTree(newFileName, newRootPath));
    }
  }  
  return result;
}
function grabChildComponents(imports, fileContent) {
  //construct regex
  let compNames = imports.reduce((arr, cur) => {
    arr.push(cur.name);
    return arr;
  }, []);
  compNames = compNames.join('|');
  let pattern = '<\s*(' + compNames + ')(>|(.|[\r\n])*?[^?]>)'
  const regExp = new RegExp(pattern, 'g');
  let matchedComponents = fileContent.match(regExp);
  return matchedComponents;
 }
 module.exports = {grabChildComponents, constructComponentTree, constructSingleLevel, constructComponentProps, importNamePath, grabAttr, digStateInBlockStatement, digStateInClassBody, grabStateProps, getClassEntry}