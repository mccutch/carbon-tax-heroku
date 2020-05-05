import React from 'react';







export class LoginApp extends React.Component{

  render(){
    return(
      <div class="container bg-light">
        <button class="btn-outline-info" onClick={this.handleLogin}>Login</button>
        <button class="btn-outline-info" onClick={this.handleLogin}>Login</button>
        <button class="btn-outline-info" onClick={this.handleLogin}>Login</button>

      </div>
    );
  }
}