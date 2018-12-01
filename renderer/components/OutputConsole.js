import React from 'react';

const OutputConsole = ({ isActive, cb_cra, cb_craOut }) => {
  let output;
  if (cb_cra) {
    output = <p>Creating new React Project...</p>
  } else {
    output = <p>{cb_craOut}</p>
  }
  return (
    <React.Fragment>
      {output}
    </React.Fragment>
  )
}

export default OutputConsole;