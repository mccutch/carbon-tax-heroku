import React from 'react';
import {getToken, refreshToken, clearToken }  from './myJWT.js';
import {ProfileDisplay} from './userProfile.js';
import {RegistrationForm} from './registrationForm.js';

const DEMO_USERNAME = process.env.REACT_APP_DEMO_USERNAME
const DEMO_PW = process.env.REACT_APP_DEMOUSER_PW


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
      loginFailed:false,
      showRegistration:false,
      showProfile:false,
    }

    this.handleClick = this.handleClick.bind(this)
    this.fetchUser = this.fetchUser.bind(this)
    this.fetchTaxes = this.fetchTaxes.bind(this)
    this.fetchProfile = this.fetchProfile.bind(this)
    this.fetchVehicles = this.fetchVehicles.bind(this)
    this.loginFailure = this.loginFailure.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.logoutSuccess = this.logoutSuccess.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.clearJWT = this.clearJWT.bind(this)
  }

  componentDidMount(){
    this.loginSuccess()
  }

  fetchUser(){
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
        this.props.returnLogin(true)
        console.log(json)
        this.props.returnUser(json)

      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchUser})
        } 
      });
  }

  fetchTaxes(){
    fetch('/my-taxes/', {
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
        //console.log(json)
        this.props.returnTaxes(json)
        /*
        this.setState({
          taxes:json
        })
        */
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchTaxes})
        } 
      });
  }

  fetchProfile(){
    fetch('/my-profile/', {
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
        this.props.returnProfile(json)
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchProfile})
        }
      });
  }

  fetchVehicles(){
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
      this.props.returnVehicles(json)
    })
    .catch(e => {
      console.log(e.message)
      if(e.message==='401'){
        refreshToken({onSuccess:this.findSavedVehicle})
      }
    });
  }

  

  loginFailure(){
    this.setState({loginFailed:true})
  }

  loginSuccess(){
    this.setState({loginFailed:false, showRegistration:false})
    this.props.refresh()
    /*
    this.fetchUser()
    this.fetchTaxes()
    this.fetchProfile()
    this.fetchVehicles()
    */
  }

  clearJWT(){
    clearToken({onSuccess:this.logoutSuccess})
  }

  logoutSuccess(){
    this.setState({
      loginFailed:false,
      showProfile:false,
    })
    this.props.logout()
  }


  handleClick(event){
    if(event.target.name==="login"){
      let data = {
        username:DEMO_USERNAME,
        password:DEMO_PW,
      }
      getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
    } else if(event.target.name==="logout"){
      this.logout()
    } else if(event.target.name==="register"){
      this.setState({showRegistration:true})
    } else if(event.target.name==="hideRegistration"){
      this.setState({showRegistration:false})
    } else if(event.target.name==="showProfile"){
      this.setState({showProfile:true})
    } else if(event.target.name==="hideProfile"){
      this.setState({showProfile:false})
    }
  }

  handleSubmit(data){
    getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
  }

  render(){
    let failureText
    if(this.state.loginFailed){
      failureText = <p>Login failed.</p>
    }

    let display
    if(this.state.showProfile){
      display = <ProfileDisplay 
                  onClick={this.handleClick} 
                  user={this.props.user} 
                  taxes={this.props.taxes}
                  profile={this.props.profile} 
                  vehicles={this.props.vehicles}
                  refreshTaxes={this.fetchTaxes} 
                  refreshUser={this.fetchUser}
                  refreshProfile={this.fetchProfile}
                  refreshVehicles={this.fetchVehicles}
                  logout={this.clearJWT}
                  displayUnits={this.props.displayUnits}
                />
    } else if(this.state.showRegistration){
      display = <RegistrationForm onClick={this.handleClick} loginSuccess={this.loginSuccess}/>
    } else if(this.props.loggedIn){
      display = 
        <div>
          <p>Hello {this.props.user.username}</p>
          <button name="showProfile" className="btn-outline-success" onClick={this.handleClick}>My profile</button>
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
      <div>
        <div className="container bg-warning py-2 my-2">
          {display}
        </div>
        <div className="container bg-warning py-2 my-2">
          <button type="button" className= "btn-outline-info" onClick={this.props.toggleDisplayUnits}>Change Units</button>
        </div>
      </div>
    )
  }
}