import React from 'react';
import {getToken, refreshToken, clearToken }  from './myJWT.js';
//import {keys} from './secret_api_keys.js';

//const MEMBER_LOGIN = keys.member_login;
const MEMBER_LOGIN = process.env.REACT_APP_DEMOUSER_LOGIN

class LoginForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      username: null,
      password: null,
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleSubmit(e){
    e.preventDefault()
    if(this.state.username && this.state.password){
      this.props.submitForm(this.state)
    }
  }

  handleChange(event){
    if(event.target.name==="username"){
      this.setState({username:event.target.value})
    } else if(event.target.name==="password"){
      this.setState({password:event.target.value})
    }
  }

  render(){

    return(
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="username"
          onChange={this.handleChange}
        />
        <input
          type="password"
          name="password"
          onChange={this.handleChange}
        />
        <button type="submit" className="btn-outline-primary">Submit login</button>
      </form>
    )
  }
}


export class LoginWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state={
      username:null,
      user_id:null,
      loginFailed:false,
    }

    this.handleClick = this.handleClick.bind(this)
    this.fetchUsername = this.fetchUsername.bind(this)
    this.loginFailure = this.loginFailure.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.logoutSuccess = this.logoutSuccess.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  fetchUsername(){
    fetch('/current-user/', {
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
        this.props.login(true)
        this.setState({
          username:json.username,
          user_id:json.id,
        })
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchUsername, onFailure:this.handleLoginFailure})
        } 
      });


  }

  loginFailure(){
    this.setState({loginFailed:true})
  }

  loginSuccess(){
    this.fetchUsername()
  }

  logoutSuccess(){
    this.setState({
      username: null,
      user_id: null, 
      loginFailed:false,
    })
    this.props.login(false)
  }


  handleClick(event){
    if(event.target.name==="login"){
      let data = {
        username:"member",
        password:MEMBER_LOGIN,
      }
      getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
    } else if(event.target.name==="logout"){
      clearToken({onSuccess:this.logoutSuccess})
    }
  }

  handleSubmit(data){
    this.setState({loginFailed:false})
    getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
  }

  render(){
    let display
    if(this.props.loggedIn){
      display = 
        <div>
          <p>Hello {this.state.username}, ID:{this.state.user_id}</p>
          <button name="logout" onClick={this.handleClick}>Logout</button>
        </div>
    } else if(this.state.loginFailed){
      display=
        <div>
          <button name="login" className="btn-outline-danger" onClick={this.handleClick}>Auto-login</button>
          <p>Login failed.</p>
          <LoginForm submitForm={this.handleSubmit}/>
        </div>
    } else {
      display = 
        <div>
          <button name="login" className="btn-outline-danger" onClick={this.handleClick}>Auto-login</button>
          <LoginForm submitForm={this.handleSubmit}/>
        </div>
    }


    return(
      <div className="container bg-warning py-2 my-2">
        {display}
        <button type="button" className= "btn-outline-warning" onClick={this.props.toggleDisplayUnits}>Change Units</button>
      </div>
    )
  }
}