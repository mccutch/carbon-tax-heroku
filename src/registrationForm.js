import React from 'react';

import { defaultTaxes } from './defaultTaxTypes.js';
import { getToken }  from './myJWT.js';

import * as helper from './helperFunctions.js';
import { fetchObject } from './helperFunctions.js';

import { CurrencySelection } from './reactComponents.js';

const MAX_PASSWORD_LEN = 30
const MAX_EMAIL_LEN = 30
const MAX_NAME_LEN = 30

const DEFAULT_CURRENCY = "AUD"

export class RegistrationForm extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      firstName: "",
      lastName: "",
      username: "",

      currency: DEFAULT_CURRENCY,
      currency_symbol:"",
      display_units:"",
      location: "",
      date_of_birth: "",

      password: "",
      password_check: "__",
      email: "",
      errorMessage:"",
      strongPassword: false,
      validEmail:false,
      validUsername:false,
      
    }

    this.handleSubmit=this.handleSubmit.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.createUser=this.createUser.bind(this)
    this.checkPasswordStrength=this.checkPasswordStrength.bind(this)
    this.createProfile=this.createProfile.bind(this)
    this.createTaxes=this.createTaxes.bind(this)
    this.validateEmail=this.validateEmail.bind(this)
    this.usernameReponse=this.usernameReponse.bind(this)
    this.postFailure=this.postFailure.bind(this)
    this.createUserFailure=this.createUserFailure.bind(this)
    this.createUserSuccess=this.createUserSuccess.bind(this)
    this.validateUsernameRegex=this.validateUsernameRegex.bind(this)
  }

  handleSubmit(e){
    e.preventDefault()
    this.validateUserData()
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="password"){
      this.checkPasswordStrength(event.target.value)
    } else if(event.target.name==="email"){
      this.validateEmail(event.target.value)
    } else if(event.target.name==="username"){
      this.validateUsernameRegex(event.target.value)
    }
  }

  checkPasswordStrength(password){
    //const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*])(?=.{8,})") 
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
    this.setState({strongPassword:strongRegex.test(password)})
  }

  validateEmail(email){
    let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
    this.setState({validEmail:emailRegex.test(email)})
  }

  validateUsernameRegex(username){
    const validUsername = new RegExp("^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$")
    this.setState({validUsername: validUsername.test(username)})
  }

  validateUserData(){
    this.setState({errorMessage:""})

    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.setState({errorMessage:"Fill in required fields."})
      return
    }

    // Validate username regex
    if(!this.state.validUsername){
      this.setState({errorMessage:"Invalid username format."})
      return
    }

    // Validate password
    if(this.state.password !== this.state.password_check){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      //this.setState({errorMessage:"Password must be 8-30 characters, including a number and special character (?!@#$%^&)"})
      this.setState({errorMessage:"Password must be 8-30 characters, including a capital letter and a number"})
      return
    }

    if(!this.state.validEmail){
      this.setState({errorMessage:"Check email address."})
      return
    }

    // Validate username
    let data = {username:this.state.username}

    fetchObject({
      method:'POST',
      url:'/account/check-username/',
      data:data,
      onSuccess:this.usernameReponse,
      onFailure:this.postFailure,
      noAuth:true,
    })
  }

  usernameReponse(json){
    if(json.unique==="false"){
      this.setState({errorMessage:"Username is already in use."})
    } else {
      this.createUser()
    }
  }

  postFailure(message){
    this.setState({errorMessage:"Error occurred while creating profile."})
  }

  createUserFailure(message){
    this.setState({errorMessage:"Unable to create user."})
  }

  createUserSuccess(){
    console.log("Create user - Success")
    let loginData = {username: this.state.username, password: this.state.password}
    getToken({data:loginData, onSuccess:this.createProfile})
  }

  createUser(){
    let userData = {
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
    }

    console.log(userData)

    fetchObject({
      method:'POST',
      url:'/account/register/',
      data:userData,
      onSuccess:this.createUserSuccess,
      onFailure:this.createUserFailure,
      noAuth:true,
    })
  }

  createProfile(){
    let profileData = {
      location:""
    }

    let profileAttributes = ["date_of_birth", "currency", "currency_symbol", "display_units"]

    for(let i in profileAttributes){
      if(this.state[profileAttributes[i]]){
        profileData[profileAttributes[i]]=this.state[profileAttributes[i]]
      }
    }

    fetchObject({
      method:'POST',
      url:'/my-profile/',
      data:profileData,
      onSuccess:this.createTaxes,
      onFailure:this.postFailure,
    })
  }

  createTaxes(){

    for (let i in defaultTaxes){
      let taxData = {
        name: defaultTaxes[i]['name'],
        price_per_kg: defaultTaxes[i]['price'],
        category: defaultTaxes[i]['category'],
        isDefault: "True",
      }

      fetchObject({
        method:'POST',
        url:'/my-taxes/',
        data:taxData,
        onSuccess:this.props.loginSuccess,
        onFailure:this.postFailure,
      })
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
          <h4>Required Information</h4>
          <input
            type="text"
            name="username"
            onChange={this.handleChange}
            placeholder="Username"
          />
          <br/>
          <input
            type="password"
            name="password"
            onChange={this.handleChange}
            placeholder="Password"
            maxLength={MAX_PASSWORD_LEN}
          />
          <br/>
          <input
            type="password"
            name="password_check"
            onChange={this.handleChange}
            placeholder="Confirm Password"
          />
          <br/>
          <input
            type="text"
            name="email"
            onChange={this.handleChange}
            placeholder="Email"
            maxLength={MAX_EMAIL_LEN}
          />
          <br/>
          <label>
            Currency:
            <CurrencySelection defaultValue={DEFAULT_CURRENCY} onChange={this.handleChange} />
          </label>
          <br/>
          <h4>Optional Information</h4>
          <input
            type="text"
            name="firstName"
            onChange={this.handleChange}
            placeholder="First name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="lastName"
            onChange={this.handleChange}
            placeholder="Last name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="location"
            onChange={this.handleChange}
            placeholder="Location"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="date"
            name="date_of_birth"
            onChange={this.handleChange}
            placeholder="Date of Birth"
          />
          <br/>
          <button type="submit" className="btn-outline-primary">Create</button>
        </form>
        <button name="hideRegistration" className="btn-outline-danger" onClick={this.props.onClick}>Cancel</button>
      </div>
    )
  }
}