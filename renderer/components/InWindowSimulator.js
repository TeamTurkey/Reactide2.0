import React from 'react';

const InWindowSimulator = (props) => {
  const style = {
    height: '60%',
  }
  return (
    <div style={style}>
      <iframe src={props.url}></iframe>
    </div>
  )
} 


export default InWindowSimulator;