import React, { Component } from 'react';

export class JWTChecker extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      jwt_access: null,
      jwt_refresh: null
    }
  }


  getToken(){
    let data = {
      username:"member",
      password:"**password**"
    }


    fetch('/api/token/', { //could be '/token-auth'? http://localhost:8000/
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if(res.status===401){
          console.log("Not found")
        }
        return res.json()
      })
      .then(json => {
        console.log(json.access)
        localStorage.setItem('access', json.access)
      })
      .catch(e => console.log(e));
  }

  getUsername(){

    let data = {Authorisation: "Bearer "+localStorage.getItem('access')};

    
    fetch('/hello/', { //could be '/token-auth'? http://localhost:8000/
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
    })
      .then(res => {
        return res.json()
      })
      .then(json => {
        console.log(json)
      })
      .catch(e => console.log(e));

  }



  render(){
    let access = localStorage.getItem('access')


    return(
      <div className="App" class="container bg-light">
        <button onClick={this.getToken}>Get token</button>
        <button onClick={this.getUsername}>Get username</button>
      </div>
    )
  }
}