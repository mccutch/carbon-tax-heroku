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

import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL, DEFAULT_DISPLAY_UNITS, POSITION_DECIMALS } from './constants.js';
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
      password_check: null,
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

    this.createProfileFailure=this.createProfileFailure.bind(this)
    this.createUserFailure=this.createUserFailure.bind(this)
    this.createUserSuccess=this.createUserSuccess.bind(this)
    this.setCurrencyFactor=this.setCurrencyFactor.bind(this)
    this.uniqueResponse=this.uniqueResponse.bind(this)
    this.validateUserData=this.validateUserData.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.handlePlaceData=this.handlePlaceData.bind(this)
    this.onDelete=this.onDelete.bind(this)
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
      getCurrencyFactor({currency:event.target.value, onSuccess:this.setCurrencyFactor})
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
      onFailure:this.createProfileFailure,
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

  createProfileFailure(message){
    this.setState({errorMessage:"Error occurred while creating profile. Please try again."})

    let key = this.state.userId

    fetchObject({
      url:`/user/${key}/`,
      onSuccess:this.onDelete,
      onFailure:this.onDelete,
      method:'DELETE'
    })
  }

  onDelete(){
    console.log("User account deleted. Ready to try again.")
  }

  createUserFailure(message){
    this.setState({errorMessage:"Unable to create user."})
  }

  createUserSuccess(json){
    console.log(json)
    this.setState({userId:json.id})
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
    let profileData = {}

    let profileAttributes = ["location", "date_of_birth", "currency", "currency_symbol", "display_units", "conversion_factor"]

    for(let i in profileAttributes){
      if(this.state[profileAttributes[i]]){
        profileData[profileAttributes[i]]=this.state[profileAttributes[i]]
      }
    }
    if(this.state.locationData || this.state.defaultLocationData){
      let data = this.state.locationData ? this.state.locationData : this.state.defaultLocationData
      profileData['loc_lat']=parseFloat(data.lat).toFixed(POSITION_DECIMALS)
      profileData['loc_lng']=parseFloat(data.lng).toFixed(POSITION_DECIMALS)
    }

    console.log(profileData)

    fetchObject({
      method:'POST',
      url:'/my-profile/',
      data:profileData,
      onSuccess:this.createTaxes,
      onFailure:this.createProfileFailure,
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
        onFailure:this.createProfileFailure,
      })
    }
  }

  handlePlaceData(place){
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

  handleLocationData(location){
    console.log("Collecting default location using IP address.")
    this.setState({defaultLocationData:location})
    
  }

  render(){
    let title = <div>Sign Up</div>

    let body = 
      <form>
        <h5>Account</h5>
        <input
          type="text"
          name="username"
          onChange={this.handleChange}
          placeholder="Username"
          className={`form-control my-2 ${this.state.validUsername ? "is-valid":""}`}
        />
        <small className="form-text text-muted">{(this.state.username&&!this.state.validUsername) ? `${validation.USERNAME_ERR}`:""}</small>
        <input
          type="password"
          name="password"
          onChange={this.handleChange}
          placeholder="Password"
          maxLength={MAX_PASSWORD_LEN}
          className={`form-control my-2 ${this.state.strongPassword ? "is-valid":""}`}
        />
        <small className="form-text text-muted">{(this.state.password&&!this.state.strongPassword) ? `${validation.PASSWORD_ERR}`:""}</small>
        <input
          type="password"
          name="password_check"
          onChange={this.handleChange}
          placeholder="Confirm Password"
          className={`form-control my-2 ${this.state.password===this.state.password_check ? "is-valid":""}`}
        />
        <small className="form-text text-muted">{(this.state.strongPassword&&this.state.password_check&&(this.state.password_check!==this.state.password)) ? "Passwords don't match.":""}</small>
        <input
          type="text"
          name="email"
          onChange={this.handleChange}
          placeholder="Email"
          maxLength={MAX_EMAIL_LEN}
          className={`form-control my-2 ${this.state.validEmail ? "is-valid":""}`}
        />
        <small className="form-text text-muted">{(this.state.email&&!this.state.validEmail) ? `${validation.EMAIL_ERR}`:""}</small>
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
        <GoogleAutocomplete
          id="locationAutocomplete"
          name="location"
          placeholder="Location"
          maxLength={MAX_NAME_LEN}
          className={`form-control my-2 ${this.state.locationData ? "is-valid" : ""}`}
          returnPlace={this.handlePlaceData}
          returnLocation={this.handleLocationData}
          onChange={this.handleChange}
        />
        <small className="form-text text-muted">Location data improves your search results when calculating trip distance.</small>
        <FormRow
          label={<div>Date of birth:</div>}
          labelWidth={4}
          input={<input type="date" name="date_of_birth" onChange={this.handleChange} className="form-control my-2" />}
        />
        <p><strong>{this.state.errorMessage}</strong></p>
      </form>

    let footer =  
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button className="btn btn-success m-2" onClick={this.validateUserData}>Create account</button>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}