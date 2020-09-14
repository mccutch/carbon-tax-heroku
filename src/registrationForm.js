import React from 'react';

import { defaultTaxes } from './defaultTaxTypes.js';
import { getToken }  from './myJWT.js';

import * as helper from './helperFunctions.js';
import { fetchObject, getCurrencyFactor } from './helperFunctions.js';
import * as units from './unitConversions.js';
import { CurrencySelection, CurrencySymbolSelection, DisplayUnitSelection, StandardModal, FormRow } from './reactComponents.js';

import { checkPasswordStrength, validateUsernameRegex, validateEmailRegex } from './validation.js';
import * as validation from './validation.js';
import { MAX_PASSWORD_LEN, MAX_EMAIL_LEN, MAX_NAME_LEN } from './validation.js';

import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL, DEFAULT_DISPLAY_UNITS } from './constants.js';
import {Modal, Button} from 'react-bootstrap';

import { GoogleAutocomplete} from './googleAutocomplete.js';

export class RegistrationForm extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      firstName: "",
      lastName: "",
      username: "",

      currency: DEFAULT_CURRENCY,
      currencyFactor:1,
      currency_symbol:DEFAULT_CURRENCY_SYMBOL,
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

    this.handleChange=this.handleChange.bind(this)

    this.createUser=this.createUser.bind(this)
    this.createProfile=this.createProfile.bind(this)
    this.createTaxes=this.createTaxes.bind(this)

    this.postFailure=this.postFailure.bind(this)
    this.createUserFailure=this.createUserFailure.bind(this)
    this.createUserSuccess=this.createUserSuccess.bind(this)
    this.setCurrencyFactor=this.setCurrencyFactor.bind(this)
    this.uniqueResponse=this.uniqueResponse.bind(this)
    this.validateUserData=this.validateUserData.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="password"){
      this.setState({strongPassword:checkPasswordStrength(event.target.value)})
    } else if(event.target.name==="email"){
      this.setState({validEmail:validateEmailRegex(event.target.value)})
    } else if(event.target.name==="username"){
      this.setState({validUsername:validateUsernameRegex(event.target.value)})
    } else if(event.target.name==="currency"){
      getCurrencyFactor({currency:event.target.name, onSuccess:this.setCurrencyFactor})
    }
  }

  setCurrencyFactor(factor){
    this.setState({conversion_factor:factor})
  }

  validateUserData(){
    //event.preventDefault()

    this.setState({errorMessage:""})

    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.setState({errorMessage:"Fill in required fields."})
      return
    }

    // Validate username regex
    if(!this.state.validUsername){
      this.setState({errorMessage:validation.USERNAME_ERR})
      return
    }

    // Validate password
    if(this.state.password !== this.state.password_check){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      this.setState({errorMessage:validation.PASSWORD_ERR})
      return
    }

    if(!this.state.validEmail){
      this.setState({errorMessage:validation.EMAIL_ERR})
      return
    }

    // Check uniqueness of username and password
    let data = {
      username:this.state.username,
      email:this.state.email,
    }

    fetchObject({
      method:'POST',
      url:'/registration/check-unique/',
      data:data,
      onSuccess:this.uniqueResponse,
      onFailure:this.postFailure,
      noAuth:true,
    })
  }

  uniqueResponse(json){
    console.log(json)
    if(json.uniqueUsername===false){
      this.setState({errorMessage:"Username is already in use."})
    } else if(json.uniqueEmail===false){
      this.setState({errorMessage:"Email is already in use."})
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

    let profileAttributes = ["date_of_birth", "currency", "currency_symbol", "display_units", "conversion_factor"]

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
        onSuccess:this.props.onSuccess,
        onFailure:this.postFailure,
      })
    }
  }

  handleLocationData(place){
    if(!place){
      this.setState({locationData:null})
      return
    }
    console.log(place)
    this.setState({
      location:place.formatted_address,
      locationData:place.geometry.location.toJSON(),
    })
  }

  render(){
    let error
    if(this.state.errorMessage){
      error = <p className="text-danger"><strong>{this.state.errorMessage}</strong></p>
    }

    let title = <div>Sign Up</div>

    let body = 
      <form>
        <h5>Account</h5>
        <input
          type="text"
          name="username"
          onChange={this.handleChange}
          placeholder="Username"
          className="form-control my-2"
        />
        <input
          type="password"
          name="password"
          onChange={this.handleChange}
          placeholder="Password"
          maxLength={MAX_PASSWORD_LEN}
          className="form-control my-2"
        />
        <input
          type="password"
          name="password_check"
          onChange={this.handleChange}
          placeholder="Confirm Password"
          className="form-control my-2"
        />
        <input
          type="text"
          name="email"
          onChange={this.handleChange}
          placeholder="Email"
          maxLength={MAX_EMAIL_LEN}
          className="form-control my-2"
        />
        <div className="form-row">
          <div className="col-9">
            <CurrencySelection name="currency" defaultValue={DEFAULT_CURRENCY} onChange={this.handleChange} />
          </div>
          <div className="col">
            <CurrencySymbolSelection name="currency_symbol" defaultValue={DEFAULT_CURRENCY_SYMBOL} onChange={this.handleChange} />
          </div>
        </div>
        <FormRow
          label={<div>Units:</div>}
          labelWidth={2}
          input={<DisplayUnitSelection name="display_units" defaultValue={DEFAULT_DISPLAY_UNITS} onChange={this.handleChange} />}
         />
        <br/>
        <h5>Profile (optional)</h5>
        <input
          type="text"
          name="firstName"
          onChange={this.handleChange}
          placeholder="First name"
          maxLength={MAX_NAME_LEN}
          className="form-control my-2"
        />
        <input
          type="text"
          name="lastName"
          onChange={this.handleChange}
          placeholder="Last name"
          maxLength={MAX_NAME_LEN}
          className="form-control my-2"
        />
       {/*
        <input
          type="text"
          name="location"
          onChange={this.handleChange}
          placeholder="Location"
          maxLength={MAX_NAME_LEN}
          className="form-control my-2"
        />
        */}
        <GoogleAutocomplete
          id="locationAutocomplete"
          name="location"
          placeholder="Location"
          className={`form-control my-2 ${this.state.locationData ? "is-valid" : ""}`}
          returnPlace={this.handleLocationData}
          onChange={this.handleChange}
        />
        <input
          type="date"
          name="date_of_birth"
          onChange={this.handleChange}
          placeholder="Date of Birth"
          className="form-control my-2"
        />
        {error}
      </form>

    let footer =  
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button className="btn btn-success m-2" onClick={this.validateUserData}>Create account</button>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}