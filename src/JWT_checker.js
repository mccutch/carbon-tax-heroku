import React from 'react';
import {getToken, refreshToken}  from './myJWT.js';

export class JWTChecker extends React.Component{
  constructor(props){
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.viewVehicles = this.viewVehicles.bind(this);
  }

  goToLogin(){
    console.log("LOGIN AGAIN")
  }

  handleLogin(event){
    let data = {}
    if(event.target.name==='good'){
      data = {
        username:"member",
        password:"Flintstones"
        
      }
      getToken({data:data})
    } else if(event.target.name==='bad'){
      data = {
        username:"member",
        password:"xxx"
      }
      getToken({data:data})
    }
  }

  viewVehicles(){
    fetch('/my-vehicles/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      }
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
      
        console.log(json)
      
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.viewVehicles, onFailure:this.goToLogin})
        }    
      });
  }

  handleRefreshClick(){
    refreshToken({onFailure:this.goToLogin})
  }

  render(){
    return(
      <div className="container bg-light">
        <button name="good" onClick={this.handleLogin}>Good login</button>
        <button name="bad" onClick={this.handleLogin}>Bad login</button>
        <button onClick={this.handleRefreshClick}>Refresh token</button>
        <button onClick={this.viewVehicles}>View vehicles</button>
      </div>
    )
  }
}