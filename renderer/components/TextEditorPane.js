import React from 'react';
import TextEditor from './TextEditor';
import TabContainer from './TabContainer';
import PropTypes from 'prop-types';

const TextEditorPane = ({ appState, setActiveTab, closeTab, onEditorValueChange }) => {
  const editorArr = [];

  if (Object.keys(appState.openTabs).length > 0) {
    console.log(appState.previousPaths[appState.previousPaths.length-1]);
    editorArr.push(
      <TextEditor
        path={appState.previousPaths[appState.previousPaths.length-1]}
        onValueChange={onEditorValueChange}
      />);
  }

  return (
    <ride-pane>
      <TabContainer appState={appState} setActiveTab={setActiveTab} closeTab={closeTab} />
      {editorArr}
    </ride-pane>
  );
};

TextEditorPane.propTypes = {
  appState: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired
};

export default TextEditorPane;
