import React from 'react';


export class LoginApp extends React.Component{

  render(){
    return(
      <div className="container bg-light">
        <button className="btn-outline-info" onClick={this.handleLogin}>Login</button>
        <button className="btn-outline-info" onClick={this.handleLogin}>Login</button>
        <button className="btn-outline-info" onClick={this.handleLogin}>Login</button>

      </div>
    );
  }
}