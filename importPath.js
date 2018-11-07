
const fs = require('fs');
const path = require('path');
const flowParser = require('flow-parser');
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
      console.log("found constructor");
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
        console.log("found state");
        return elem.expression.right.properties.forEach(elem => {
          ret.push(elem.key.name);
          return ret;
        });
      }
  });
  return ret;
}
const statelessFunctionReturnObject = (json) => {
  console.log('INSIDE STATELESS FUNCTION RETURN OBJECT',json);
  let returnObj;
  json.body.forEach((declaration) => {
    if(declaration.type ==='VariableDeclaration') returnObj = declaration;
  })
  console.log( returnObj.declarations[0].init.body.body[0].argument);
  return returnObj.declarations[0].init.body.body[0].argument;
}
const statefulReactComponent = (json) => {
  let output;
      getClassEntry(json).body.forEach(MD => {
        if(MD.key.name === 'render') {
          MD.value.body.body.forEach(func => {
            if(func.type === 'ReturnStatement') {
              output = func.argument;
            }
          })
        }
      })
  return output;
}


// console.log(statelessFunctionReturnObject(test))

// need to redo this function.
const grabAttr = (arrOfAttr) => {
  // console.log(arrOfAttr)
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
      } else {
          acc[curr.name.name] = curr.value.expression.name;
      }
    } else {
      acc[curr.name.name] = curr.value.value;
    }
    return acc;
  },{})
};

// console.log(grabAttr(statelessFunctionReturnObject(test)))

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
const getInitialComponentandRecurse = (returnObj) => {
  const output = {};
  const innerFunc = (returnObj) => {
    console.log('INSIDE GET INITIAL COMPONENET AND RECURSE', returnObj)
    output[returnObj.openingElement.name.name] = grabAttr(returnObj.openingElement.attributes);

    returnObj.children.forEach((child) => {
      if (!child.children) return;
      if (child.children.length > 1) innerFunc(child);
        if (child.type === 'JSXElement') {
          if (child.openingElement.name.name) {
            output[child.openingElement.name.name] = grabAttr(child.openingElement.attributes);
          }
      }
    })
  }
  innerFunc(returnObj);
  return output;
}

function isStateful(jsonObj) {
  return (getClassEntry(jsonObj) !== null);
}
//module.exports = stateParser;

// TODO:
// check for ternanry props,
// conditional rendering
// function.bind props

function constructSingleLevel(jsxPath) {
  let reactObj;
  const fileContent = fs.readFileSync(jsxPath, { encoding: 'utf-8' });
  let jsonObj = flowParser.parse(fileContent);
  console.log('IN CONSTRUCT SINGLE LEVEL', jsonObj)
  let imports = importNamePath(jsonObj);
  let state = grabStateProps(jsonObj);
  if(isStateful(jsonObj)) {
    console.log('this is a stateful component');
    reactObj = statefulReactComponent(jsonObj);
  } else{
    console.log('This is a stateless component');
    reactObj = statelessFunctionReturnObject(jsonObj);
  }
  console.log('THIS IS REACT OBJ', reactObj);
  let returnTags = getInitialComponentandRecurse(reactObj);
  let outputImports = [];
  for (let tag of imports) {
    if(returnTags[tag.name]) {
      tag.props = returnTags[tag.name];
      outputImports.push(tag);
    }
  }

  let outputObj = {
    name: path.basename(jsxPath).split('.')[0],
    childProps: outputImports,
    stateProps: state,
    children: []
  }
  console.log(outputObj);
  return outputObj;
}

function constructComponentTree(filePath) {
  let result = constructSingleLevel(filePath);
  console.log(filePath);
  console.log(path.dirname(filePath));
  for(let childProp of result.childProps) {
    console.log(childProp);
    console.log(childProp.path);
    console.log(__dirname);
    result.children.push(constructComponentTree(path.join(path.dirname(filePath),path.basename(childProp.path) + '.jsx')));
  }
  return result;
}

console.log(JSON.stringify(constructComponentTree('/Users/oscarchan/Desktop/perfect-React-project/components/App.jsx')));