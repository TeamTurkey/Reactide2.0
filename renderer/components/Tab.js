import React from 'react';
import PropTypes from 'prop-types';
import Box from 'box';
const Tab = ({ name, setActiveTab, path, closeTab }) => {
  return (
    <li className="texteditor tab" onClick={() => { setActiveTab(path); }} >
      <div className="title">{name}</div>
      <Box onClick = {setActiveBox} color='red' id={2}></Box>
      <Row color='blue'></Row>
      <div className="close-icon" onClick={(event) => { closeTab(path, event); }} />
    </li>
  );
};

export default Tab;
