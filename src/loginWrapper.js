import React from 'react';
import {getToken, clearToken }  from './myJWT.js';
import {ProfileDisplay} from './userProfile.js';
import {RegistrationForm} from './registrationForm.js';
import {Modal, Button} from 'react-bootstrap';
import {StandardModal} from './reactComponents.js';


const DEMO_USERNAME = process.env.REACT_APP_DEMO_USERNAME
const DEMO_PW = process.env.REACT_APP_DEMOUSER_PW


export class LoginForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      username: null,
      password: null,
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getJWT = this.getJWT.bind(this)
    this.handleLoginFailure = this.handleLoginFailure.bind(this)
  }

  handleSubmit(e){
    e.preventDefault()
    if(this.state.username && this.state.password){
      this.getJWT({username: this.state.username, password:this.state.password})
    }
  }

  handleChange(event){
    if(event.target.name==="username"){
      this.setState({username:event.target.value})
    } else if(event.target.name==="password"){
      this.setState({password:event.target.value})
    }
  }

  getJWT(data){
    getToken({
      data:data, 
      onSuccess:()=>{
        this.props.hideModal()
        this.props.onSuccess()
      }, 
      onFailure:this.handleLoginFailure})
  }

  handleLoginFailure(){
    this.setState({loginFailed: true})
  }

  render(){
    let failureText
    if(this.state.loginFailed){
      failureText = <p>Login failed. <a href='/account/password_reset/'>Forgot your password?</a></p>
    }

    let title = <div>Login</div>

    let form = 
      <div>
       {failureText}
        <form onSubmit={this.handleSubmit}>
          <input type="text" name="username" placeholder="Username or Email" onChange={this.handleChange} className="form-control m-2"/>
          <input type="password" name="password" placeholder="Password" onChange={this.handleChange} className="form-control m-2"/>
          <button type="submit" className="btn btn-success m-2">Login</button>
        </form>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={form} />
  }
}

export function logoutBrowser({onSuccess}){
  clearToken({onSuccess:onSuccess})
}

export function demoLogin({onSuccess, onFailure}){
  let data = {
    username:DEMO_USERNAME,
    password:DEMO_PW,
  }
  getToken({data:data, onSuccess:onSuccess, onFailure:onFailure})
}

/*
export class LoginWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state={
      loginFailed:false,
      showRegistration:false,
      showProfile:false,
    }

    this.handleClick = this.handleClick.bind(this)
    this.loginFailure = this.loginFailure.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.logoutSuccess = this.logoutSuccess.bind(this)
    this.getJWT = this.getJWT.bind(this)
    this.clearJWT = this.clearJWT.bind(this)
  }

  componentDidMount(){
    this.loginSuccess()
  }

  loginFailure(){
    this.setState({loginFailed:true})
  }

  loginSuccess(){
    this.setState({loginFailed:false, showRegistration:false})
    this.props.refresh()
  }

  getJWT(data){
    getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
  }

  clearJWT(){
    console.log("JWT cleared.")
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
    if(event.target.name==="demoLogin"){
      let data = {
        username:DEMO_USERNAME,
        password:DEMO_PW,
      }
      getToken({data:data, onSuccess:this.loginSuccess, onFailure:this.loginFailure})
    } else if(event.target.name==="logout"){
      this.clearJWT()
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


  render(){
    let failureText
    if(this.state.loginFailed){
      failureText = <p>Login failed. <a href='/account/password_reset/'>Forgot your password?</a></p>
    }

    let display
    if(this.state.showProfile){
      display = <ProfileDisplay 
                  onClick={this.handleClick} 
                  user={this.props.user} 
                  taxes={this.props.taxes}
                  profile={this.props.profile} 
                  vehicles={this.props.vehicles}
                  fuels={this.props.fuels}
                  emissions={this.props.emissions}
                  refresh={this.props.refresh}
                  logout={this.clearJWT}
                  displayUnits={this.props.displayUnits}
                  stats={this.props.stats}
                />
    } else if(this.state.showRegistration){
      display = <RegistrationForm onClick={this.handleClick} loginSuccess={this.loginSuccess}/>
    } else if(this.props.loggedIn){
      display = 
        <div>
          <p>Hello {this.props.user.username}</p>
          <button name="showProfile" className="btn btn-outline-success" onClick={this.handleClick}>My profile</button>
          <button name="logout" className="btn btn-outline-danger" onClick={this.handleClick}>Logout</button>
        </div>
    } else {
      display=
        <div>
          <button name="demoLogin" className="btn btn-outline-danger" onClick={this.handleClick}>Demo User</button>
          <button name="register" className="btn btn-outline-success" onClick={this.handleClick}>Create an account</button>
          <button type="button" className= "btn btn-outline-info" onClick={this.props.toggleDisplayUnits}>Change Units</button>
          {failureText}
          <LoginForm submitForm={this.getJWT}/>
        </div>
    }

    return(
      <div className="container bg-warning py-2 my-2">
        {display}
      </div>
    )
  }
}
*/