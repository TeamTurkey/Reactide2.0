import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ name, setActiveTab, path, closeTab }) => {
  return (
    <li className="texteditor tab" onClick={() => { setActiveTab(path); }} >
      <div className="title">{name}</div>
      <div className="close-icon" onClick={(event) => { closeTab(path, event); }} />
    </li>
  );
};

export default Tab;
