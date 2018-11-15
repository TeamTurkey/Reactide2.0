import React from 'react';
import Tab from './Tab';
import PropTypes from 'prop-types';

const TabContainer = ({
  appState,
  setActiveTab,
  closeTab
}) => {
  const tabs = [];
    // for (var i = 0; i < appState.openTabs.length; i++) {
    //   tabs.push(
    //     <Tab 
    //       key={i} 
    //       name={appState.openTabs[i].name} 
    //       setActiveTab={setActiveTab} 
    //       id={appState.openTabs[i].id} 
    //       closeTab={closeTab}
    //     />);
    // }
    for (let key in appState.openTabs) {
      tabs.push(
        <Tab
          key={key}
          name={appState.openTabs[key].name}
          isActive={appState.previousPaths[appState.previousPaths.length - 1] === key}
          setActiveTab = {setActiveTab}
          path={key}
          closeTab={closeTab}
          />
      );
      console.log(tabs);
      console.log('OPENTABS', appState.openTabs);
    }
    return (
      <ul className="list-inline tab-bar inset-panel tab-container">
        {tabs}
      </ul>
    )
}

TabContainer.propTypes = {
  appState: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired
}

export default TabContainer;