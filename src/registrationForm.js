import React from 'react';

import { defaultTaxes } from './defaultTaxTypes.js';
import { getToken }  from './myJWT.js';

import * as helper from './helperFunctions.js';

const MAX_PASSWORD_LEN = 30
const MAX_EMAIL_LEN = 30
const MAX_NAME_LEN = 30

export class RegistrationForm extends React.Component{
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
      validEmail:false,
      location: "",
      date_of_birth: "",
    }

    

    this.handleSubmit=this.handleSubmit.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.createUser=this.createUser.bind(this)
    this.checkPasswordStrength=this.checkPasswordStrength.bind(this)
    this.createProfile=this.createProfile.bind(this)
    this.createTaxes=this.createTaxes.bind(this)
    this.validateEmail=this.validateEmail.bind(this)
  }

  checkPasswordStrength(password){
    //const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*])(?=.{8,})") 
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
    this.setState({strongPassword:strongRegex.test(password)})
  }

  validateEmail(email){
    this.setState({validEmail:helper.validateEmail(email)})
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
        if(e.message==="403"){
          this.setState({errorMessage:"403 - You may be logged in on another tab."})
        }
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
        console.log("Create user - success")
        console.log(json)
        let loginData = {username: userData.username, password: userData.password}
        getToken({data:loginData, onSuccess:this.createProfile})
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==="400"){
          this.setState({errorMessage:"Error processing registration, check email address is valid."})
        } else {
          this.setState({errorMessage:"Error processing registration."})
        }
      });
  }
  
  createProfile(){
    let profileData = {
      location: this.state.location,
    }
    if(this.state.date_of_birth){
      profileData['date_of_birth']=this.state.date_of_birth
    }


    fetch('my-profile/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
      body: JSON.stringify(profileData)
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
      this.createTaxes()
    })
    .catch(e => {
      console.log(e.message)
    })
  }

  createTaxes(){

    for (let i in defaultTaxes){
      let taxData = {
        name: defaultTaxes[i]['name'],
        price_per_kg: defaultTaxes[i]['price'],
        category: defaultTaxes[i]['category'],
      }

      console.log(taxData)
      
      fetch('/my-taxes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer "+localStorage.getItem('access')
        },
        body: JSON.stringify(taxData)
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
        this.props.loginSuccess()
      })
      .catch(e => {
        console.log(e.message)
      })
    }
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