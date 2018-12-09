import React from 'react';

const OutputConsole = ({ isActive, handleCRA, handleCRAOut }) => {
  let output;
  if (handleCRA) {
    output = <p>Creating new React Project...</p>
  } else {
    output = <p>{handleCRAOut}</p>
  }
  return (
    <React.Fragment>
      {output}
    </React.Fragment>
  )
}

export default OutputConsole;