import React from 'react';

const InWindowSimulator = (props) => {
  const style = {
    height: '60%',
    width: '100%'
  }
  return (
    <div>
      <iframe style = {style} src={props.url}></iframe>
    </div>
  )
} 
export default InWindowSimulator;
