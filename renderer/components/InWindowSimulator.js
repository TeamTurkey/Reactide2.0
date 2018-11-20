import React from 'react';

class InWindowSimulator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url : ' '
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log('AFTER RECEIVING PROPS', this.state)
    if(nextProps.url !== this.state.url) {
      this.setState({url: this.props.url});
    }
  }
  render() {
    console.log('state in render', this.state);
    const style = {
      height: '60%',
      width: '100%',
      borderWidth: '0px',
    }
      return (
        <div>
          <iframe style = {style} src={this.state.url}></iframe>
        </div>
      )
  }
}
export default InWindowSimulator;
