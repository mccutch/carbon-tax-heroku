import React from 'react';
import {getToken, refreshToken, clearToken }  from './myJWT.js';
//import {keys} from './secret_api_keys.js';

//const MEMBER_LOGIN = keys.member_login;
const DEMO_USERNAME = process.env.REACT_APP_DEMO_USERNAME
const DEMO_PW = process.env.REACT_APP_DEMOUSER_PW

const MAX_PASSWORD_LEN = 30
const MAX_EMAIL_LEN = 30
const MAX_NAME_LEN = 30

class RegistrationForm extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      password_check: "__",
      email: "",
      errorMessage:"",
      strongPassword: false,
      location: "",
    }

    this.handleSubmit=this.handleSubmit.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.createUser=this.createUser.bind(this)
    this.checkPasswordStrength=this.checkPasswordStrength.bind(this)
  }

  checkPasswordStrength(password){
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\?!@#\$%\^&\*])(?=.{8,})") 
    this.setState({strongPassword:strongRegex.test(password)})
  }

  validateUserData(){
    this.setState({errorMessage:""})

    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.setState({errorMessage:"Fill in required fields."})
      return
    }

    // Validate password
    if(this.state.password != this.state.password_check){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      this.setState({errorMessage:"Password must be 8-30 characters, including a number and special character (?!@#$%^&)"})
      return
    }
    


    // Validate username
    let data = {username:this.state.username}
    fetch('/account/check-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
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
        if(json.unique==="false"){
          this.setState({errorMessage:"Username is already in use."})
        } else {
          this.createUser()
        }
      })
      .catch(e => {
        console.log(e.message)
      });
  }


  createUser(){

    let userData = {
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
    }


    fetch('/account/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
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
        let loginData = {username: userData.username, password: userData.password}
        this.props.login(loginData)
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==="400"){
          this.setState({errorMessage:"Error processing registration, check email address."})
        } else {
          this.setState({errorMessage:"Error processing registration."})
        }
      });
  }

  handleSubmit(e){
    e.preventDefault()
    this.validateUserData()
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="password"){
      this.checkPasswordStrength(event.target.value)
    }
  }

  render(){
    let error
    if(this.state.errorMessage){
      error = <p>{this.state.errorMessage}</p>
    }

    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          {error}
          <input
            type="text"
            name="firstName"
            onChange={this.handleChange}
            placeHolder="First name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="lastName"
            onChange={this.handleChange}
            placeHolder="Last name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="username"
            onChange={this.handleChange}
            placeHolder="Username"
          />
          <br/>
          <input
            type="password"
            name="password"
            onChange={this.handleChange}
            placeHolder="Password"
            maxLength={MAX_PASSWORD_LEN}
          />
          <br/>
          <input
            type="password"
            name="password_check"
            onChange={this.handleChange}
            placeHolder="Confirm Password"
          />
          <input
            type="text"
            name="email"
            onChange={this.handleChange}
            placeHolder="Email"
            maxLength={MAX_EMAIL_LEN}
          />
          <input
            type="text"
            name="location"
            onChange={this.handleChange}
            placeHolder="Location"
            maxLength={MAX_NAME_LEN}
          />
          <br/>
          <button type="submit" className="btn-outline-primary">Create</button>
        </form>
        <button name="hideRegistration" className="btn-outline-danger" onClick={this.props.onClick}>Cancel</button>
      </div>
    )
  }
}

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
        <button type="submit" className="btn-outline-primary">Login</button>
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
      showRegistration:false,
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
        username:DEMO_USERNAME,
        password:DEMO_PW,
      }
      getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
    } else if(event.target.name==="logout"){
      clearToken({onSuccess:this.logoutSuccess})
    } else if(event.target.name==="register"){
      this.setState({showRegistration:true})
    } else if(event.target.name==="hideRegistration"){
      this.setState({showRegistration:false})
    }
  }

  handleSubmit(data){
    this.setState({loginFailed:false, showRegistration:false})
    getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
  }

  render(){
    let failureText
    if(this.state.loginFailed){
      failureText = <p>Login failed.</p>
    }


    let display
    if(this.state.showRegistration){
      display = <RegistrationForm onClick={this.handleClick} login={this.handleSubmit}/>
    } else if(this.props.loggedIn){
      display = 
        <div>
          <p>Hello {this.state.username}</p>
          <button name="logout" className="btn-outline-danger" onClick={this.handleClick}>Logout</button>
        </div>
    } else {
      display=
        <div>
          <button name="login" className="btn-outline-danger" onClick={this.handleClick}>Demo User</button>
          <button name="register" className="btn-outline-success" onClick={this.handleClick}>Create an account</button>
          {failureText}
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