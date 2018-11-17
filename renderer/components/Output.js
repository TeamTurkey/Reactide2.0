import React from 'react';

const Output = (props) => { 
  let output;
  console.log('IN OUTPUT.js', props.craOut)
  if(props.cra) {
    output = <p>Creating new React Project...</p>
  } else{
    output = <p>{props.craOut}</p>
  }
  return(
    <ride-pane>
      {output}
    </ride-pane>
  )
}

export default Output;