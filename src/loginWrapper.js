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
        this.props.app.hideModal()
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

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={form} />
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