import React from 'react';
import { getToken, refreshToken }  from './myJWT.js';

export class JWTChecker extends React.Component{
  constructor(props){
    super(props);
    /*
    this.refreshToken = this.refreshToken.bind(this);
    */
    this.getUsername = this.getUsername.bind(this);

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.viewVehicles = this.viewVehicles.bind(this);
  }

  /*
  getToken(data){
    

    fetch('/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then(json => {
        console.log(json.access)
        console.log(json.refresh)
        localStorage.setItem('access', json.access)
        localStorage.setItem('refresh', json.refresh)
      })
      .catch(e => {
        console.log(e)
      });
  }

  refreshToken(callback, args){
    console.log("Refreshing token...")
    let data = {}
    try {
      data = {
        refresh:localStorage.getItem('refresh')
      }
    } catch {
      console.log("No refresh token")
      return
    }

    fetch('/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if(res.ok){
          return res.json()
        } else {
          throw new Error(res.status);
        }
        
      })
      .then(json => {
        console.log(json.access)
        localStorage.setItem('access', json.access)
        if(callback){
          if(args){
            callback.apply(this, args)
          } else {
            callback()
          }
          
        }
      
      })
      .catch(e => {
        console.log(e)
      });

  }
  */

  getUsername(){

    
    fetch('/hello/', { //could be '/token-auth'? http://localhost:8000/
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
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
        console.log("Expired token.")
        console.log(e)
        refreshToken({onSuccess:this.getUsername, onFailure:this.goToLogin})
      });

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
      <div className="App" class="container bg-light">
        <button name="good" onClick={this.handleLogin}>Good login</button>
        <button name="bad" onClick={this.handleLogin}>Bad login</button>
        <button onClick={this.getUsername}>Get username</button>
        <button onClick={this.handleRefreshClick}>Refresh token</button>
        <button onClick={this.viewVehicles}>View vehicles</button>
      </div>
    )
  }
}