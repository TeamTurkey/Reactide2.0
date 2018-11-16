import React from 'react';
import { findDOMNode } from 'react-dom';

class MockComponentTree extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  renderChildrenTrees(children) {
    if (children && children.length) {
      let renderArr = [];
      children.forEach(elem => {
        renderArr.push(this.renderTree(elem));
      })
      return (<ul className="tree_rows">{renderArr}</ul>);
    }
  }

  renderStateProps(stateProps) {
    if (stateProps && stateProps.length) {
      let renderArr = [];
      stateProps.forEach(elem => {
        renderArr.push(<li>{elem}</li>)
      });
      return (
        <ul className="state_props">
          {renderArr}
        </ul>
      );
    }
  }

  renderChildProps(childProps) {
    if (childProps && childProps.length > 0) {
      let renderArr = [];
      childProps.forEach(elem => {
        renderArr.push(<li>{elem.name}
          <ul className="comp_props">
            {Object.keys(elem.props).map(key =>
              <li>{key}: <i>{elem.props[key]}</i></li>
            )}
          </ul>
        </li>);
      });
      return (
        <ul className="comp_refs">
          {renderArr}
        </ul>
      );
    }
  }

  renderTree(treeObj) {
    const { name, stateProps, childProps, children } = treeObj;
    let renderArr = [];

    return (
      <li key={'ct_node-li' + name} className="tree_row">
        <input type="checkbox" id={'ct_node-npt_' + name} key={'ct_node-npt_' + name} />
        <label key={'ct_node-lbl_' + name} id={'ct_node-lbl_' + name} className="tree_node" htmlFor={'ct_node-npt_' + name}>{name}</label>
        {(stateProps.length > 0 || childProps.length > 0) && (
          <div className="props-container">
            <span className="props-form">
              {stateProps.length > 0 && (
                <React.Fragment>
                  <input type="checkbox" id={"ct_state-npt_" + name} />
                  <label htmlFor={"ct_state-npt_" + name}>[state_props] ({stateProps.length})</label><br />
                  {this.renderStateProps(stateProps)}
                </React.Fragment>)}
              {childProps.length > 0 && (
                <React.Fragment>
                  <input type="checkbox" id={"ct_child-npt_" + name} />
                  <label htmlFor={"ct_child-npt_" + name}>[comp_props] ({childProps.length})</label><br />
                  {this.renderChildProps(childProps)}
                </React.Fragment>)}
            </span>
          </div>
        )}
        {this.renderChildrenTrees(children)}
      </li>
    );
  }

  render() {
    console.log('THESE ARE THE COMPONENT TREE PROPS', this.props.componentTreeObj);
    let componentTree = [];

    return (
      <div className="tree-view-resizer tool-panel">
        <ul className="tree">
          {this.renderTree(this.props.componentTreeObj)}
        </ul>
      </div>
    );
  }
}

// function renderChildrenTrees(children) {
//   if (children && children.length) {
//     let renderArr = [];
//     children.forEach(elem => {
//       renderArr.push(renderTree(elem));
//     })
//     return (<ul className="tree_rows">{renderArr}</ul>);
//   }
// }

// function renderStateProps(stateProps) {
//   if (stateProps && stateProps.length) {
//     let renderArr = [];
//     stateProps.forEach(elem => {
//       renderArr.push(<li>{elem}</li>)
//     });
//     return (
//       <ul className="state_props">
//         {renderArr}
//       </ul>
//     );
//   }
// }

// function renderChildProps(childProps) {
//   if (childProps && Object.keys(childProps)) {
//     let renderArr = [];
//     console.log('childprop', childProps.props);
//     childProps.forEach(elem => {
//       renderArr.push(<li>{elem.name}
//         <ul className="comp_props">
//           {Object.keys(elem.props).map(key =>
//             <li>{key}: <i>{elem.props[key]}</i></li>
//           )}
//         </ul>
//       </li>);
//     });
//     return (
//       <ul className="comp_refs">
//         {renderArr}
//       </ul>
//     );
//   }
// }
// function renderTree(treeObj) {
//   const { name, stateProps, childProps, children } = treeObj;
//   let renderArr = [];

//   return (
//     <li key={'ct_node-li' + name} className="tree_row">
//       <input type="checkbox" id={'ct_node-npt_' + name} key={'ct_node-npt_' + name} />
//       <label key={'ct_node-lbl_' + name} id={'ct_node-lbl_' + name} className="tree_node" htmlFor={'ct_node-npt_' + name}>{treeObj.name}</label>
//       <div className="props-container">
//         <span className="props-form">
//           {stateProps.length > 0 && (
//             <div>
//               <input type="checkbox" id={"ct_state-npt_" + name} />
//               <label htmlFor={"ct_state-npt_" + name}>[state_props] ({stateProps.length})</label><br />
//               {renderStateProps(stateProps)}
//             </div>)}
//           <input type="checkbox" id={"ct_child-npt_" + name} />
//           <label htmlFor={"ct_child-npt_" + name}>[comp_props] ({childProps.length})</label><br />
//           {renderChildProps(treeObj.childProps)}
//         </span>
//       </div>
//       {renderChildrenTrees(treeObj.children)}
//     </li>
//   );
// }

// const MockComponentTree = (props) => {
//   console.log('THESE ARE THE COMPONENT TREE PROPS', props.componentTreeObj);
//   let componentTree = [];

//   if (props.componentTreeObj) {
//     componentTree.push(
//       <main className="styleguide-sections">
//         <div className="tree-view-resizer tool-panel">
//           <div className="tree-view-scroller">
//             <ul className="tree">
//               {renderTree(props.componentTreeObj)}
//             </ul>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <div className="item-views">
//       <div className="styleguide pane-item">
//         <header className="styleguide-header">
//           <h5>Component Tree</h5>
//         </header>
//         {componentTree}
//       </div>
//     </div>
//   );
// };
/* // <div className="item-views">
//   <div className="styleguide pane-item">
//     <header className="styleguide-header">
//       <h5>Component Tree</h5>
//     </header>
//     {componentTree}
//   </div>
// </div> */

// <ul className="tree">
//           <li>
//             <input type="checkbox" checked="checked" id="a1" />
//             <label className="tree_label" htmlFor="a1">app</label>
//             <ul>
//               <li>
//                 <input type="checkbox" checked="checked" id="c1" />
//                 <label className="tree_label" htmlFor="c1">header</label>
//                 <ul>
//                   <li>
//                     <input type="checkbox" checked="checked" id="c2" />
//                     <label htmlFor="c2" className="tree_label">h1</label>
//                     <ul>
//                       <li>
//                         <input type="checkbox" id="c14" disabled />
//                         <label htmlFor="c14" className="tree_label">todos</label>
//                       </li>
//                       <li>
//                         <input type="checkbox" id="c15" disabled />
//                         <label htmlFor="c15" className="tree_label">input</label>
//                       </li>
//                     </ul>
//                   </li>
//                   <li>
//                     <input type="checkbox" checked="checked" id="c3" />
//                     <label htmlFor="c3" className="tree_label">Looong level 1 <br />label text</label>
//                     <ul>
//                       <li>
//                         <input type="checkbox" id="c13" disabled />
//                         <label htmlFor="c13" className="tree_label">Level 2</label>
//                       </li>
//                       <li>
//                         <input type="checkbox" checked="checked" id="c4" />
//                         <label htmlFor="c4" className="tree_label">
//                           <span className="treecaret">Sample</span>
//                           <span className="tree_custom">
//                             type: <span className="text-info">'input'</span><br />
//                             className: <span className="text-info">'new-todo'</span><br />
//                             type: <span className="text-info">'text'</span><br />
//                             placeholder: <span className="text-info">'What needs to be done?'</span><br />
//                             autoFocus: <span className="text-info">true</span><br />
//                             value: <span className="text-info">''</span>
//                           </span>
//                         </label>
//                         <ul>
//                           <li>
//                             <input type="checkbox" id="c12" disabled />
//                             <label htmlFor="c12" className="tree_label">Level 3</label>
//                           </li>
//                         </ul>
//                       </li>
//                     </ul>
//                   </li>
//                 </ul>
//               </li>

//               <li>
//                 <input type="checkbox" checked="checked" id="c5" />
//                 <label className="tree_label" htmlFor="c5">section</label>
//                 <ul>
//                   <li>
//                     <input type="checkbox" checked="checked" id="c6" />
//                     <label htmlFor="c6" className="tree_label">input</label>
//                     <ul>
//                       <li>
//                         <input type="checkbox" id="c11" disabled />
//                         <label htmlFor="c11" className="tree_label">Level 2</label>
//                       </li>
//                     </ul>
//                   </li>
//                   <li>
//                     <input type="checkbox" checked="checked" id="c7" />
//                     <label htmlFor="c7" className="tree_label">ul</label>
//                     <ul>
//                       <li>
//                         <input type="checkbox" id="c10" disabled />
//                         <label htmlFor="c10" className="tree_label">Level 2</label>
//                       </li>
//                       <li>
//                         <input type="checkbox" checked="checked" id="c8" />
//                         <label htmlFor="c8" className="tree_label">Level 2</label>
//                         <ul>
//                           <li>
//                             <input type="checkbox" id="c9" disabled />
//                             <label htmlFor="c9" className="tree_label">Level 3</label>
//                           </li>
//                         </ul>
//                       </li>
//                     </ul>
//                   </li>
//                   <li>
//                     <input type="checkbox" checked="checked" id="c20" />
//                     <label htmlFor="c20" className="tree_label">footer</label>
//                     <ul>
//                       <li>
//                         <input type="checkbox" id="c21" disabled />
//                         <label htmlFor="c21" className="tree_label">span</label>
//                       </li>
//                       <li>
//                         <input type="checkbox" checked="checked" id="c22" />
//                         <label htmlFor="c22" className="tree_label">ul</label>
//                         <ul>
//                           <li>
//                             <input type="checkbox" checked="checked" id="c23" />
//                             <label htmlFor="c23" className="tree_label">li</label>
//                             <ul>
//                               <li>
//                                 <input type="checkbox" id="c25" disabled />
//                                 <label htmlFor="c25" className="tree_label">a</label>
//                               </li>
//                             </ul>
//                           </li>
//                           <li>
//                             <input type="checkbox" id="c24" disabled />
//                             <label htmlFor="c24" className="tree_label">li</label>
//                           </li>
//                         </ul>
//                       </li>
//                     </ul>
//                   </li>
//                 </ul>
//               </li>
//             </ul>
//           </li>
//         </ul>

export default MockComponentTree;
