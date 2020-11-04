import React from 'react';

import { defaultTaxes } from './defaultTaxTypes.js';
import { getToken }  from './myJWT.js';

import * as helper from './helperFunctions.js';
import { apiFetch, getCurrencyFactor } from './helperFunctions.js';
import * as units from './unitConversions.js';
import { CurrencySelection, CurrencySymbolSelection, DisplayUnitSelection, StandardModal, FormRow } from './reactComponents.js';

import { PasswordInput, PasswordCheckInput, UsernameInput, EmailInput} from './validation.js';
import * as validation from './validation.js';

import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL, DEFAULT_DISPLAY_UNITS, POSITION_DECIMALS, MAX_LEN_NAME } from './constants.js';
import {Modal, Button} from 'react-bootstrap';

import { GoogleAutocomplete} from './googleAutocomplete.js';
import * as api from './urls.js';

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
      submitted:false,
    }


    this.handleChange=this.handleChange.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.handlePlaceData=this.handlePlaceData.bind(this)

    this.validateUserData=this.validateUserData.bind(this)
    this.createUser=this.createUser.bind(this)
    this.createProfile=this.createProfile.bind(this)
    this.createTaxes=this.createTaxes.bind(this)

    this.createProfileFailure=this.createProfileFailure.bind(this)
    this.createUserFailure=this.createUserFailure.bind(this)
    this.createUserSuccess=this.createUserSuccess.bind(this)
    this.setCurrencyFactor=this.setCurrencyFactor.bind(this)
    this.handleUnique=this.handleUnique.bind(this)
    
    this.onDelete=this.onDelete.bind(this)
    this.returnError=this.returnError.bind(this)

    //Validation return
    this.setStrongPassword=this.setStrongPassword.bind(this)
    this.setPasswordsMatch=this.setPasswordsMatch.bind(this)
    this.setValidUsername=this.setValidUsername.bind(this)
    this.setValidEmail=this.setValidEmail.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="currency"){
      getCurrencyFactor({
        currency:event.target.value, 
        onSuccess:this.setCurrencyFactor,
      })
    }
  }

  setCurrencyFactor(factor){
    this.setState({conversion_factor:factor})
  }

  setStrongPassword(bool){this.setState({strongPassword:bool})}
  setPasswordsMatch(bool){this.setState({passwordsMatch:bool})}
  setValidUsername(bool){this.setState({validUsername:bool})}
  setValidEmail(bool){this.setState({validEmail:bool})}

  returnError(errorMessage){
    this.setState({
      errorMessage:errorMessage,
      submissionPending:false,
    })
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

  validateUserData(e){
    e.preventDefault()
    this.setState({
      errorMessage:"",
      submitted:true,
      submissionPending:true,
    })

    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.returnError("Fill in required fields.")
      return
    }
    // Validate username regex
    if(!this.state.validUsername){
      this.returnError(validation.USERNAME_ERR)
      return
    }
    // Validate password
    if(!this.state.strongPassword){
      this.returnError(validation.PASSWORD_ERR)
      return
    }
    if(!this.state.passwordsMatch){
      this.returnError(validation.PASSWORD_CHECK_ERR)
      return
    }
    if(!this.state.validEmail){
      this.returnError(validation.EMAIL_ERR)
      return
    }

    // Check uniqueness of username and password
    validation.checkUniqueUser({
      username:this.state.username,
      email:this.state.email,
      onSuccess:this.handleUnique,
      onFailure:this.createUserFailure,
    })
  }

  handleUnique(json){
    if(json.uniqueUsername===false){
      this.returnError("Username is already in use.")
      this.setState({validUsername:false})
    } else if(json.uniqueEmail===false){
      this.returnError("Email is already in use.")
      this.setState({validEmail:false})
    } else {
      this.createUser()
    }
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

    apiFetch({
      method:'POST',
      url:api.REGISTER,
      data:userData,
      onSuccess:this.createUserSuccess,
      onFailure:this.createUserFailure,
      noAuth:true,
    })
  }

  createUserFailure(message){
    this.returnError("Unable to create user.")
  }

  createUserSuccess(json){
    console.log(json)
    this.setState({userId:json.id})
    console.log("Create user - Success")
    let loginData = {username: this.state.username, password: this.state.password}
    getToken({data:loginData, onSuccess:this.createProfile})
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

    apiFetch({
      method:'POST',
      url:api.MY_PROFILE,
      data:profileData,
      onSuccess:this.createTaxes,
      onFailure:this.createProfileFailure,
    })
  }

  createProfileFailure(message){
    this.returnError("Error occurred while creating profile. Please try again.")

    let key = this.state.userId
    apiFetch({
      url:`${api.USER}/${key}/`,
      onSuccess:this.onDelete,
      onFailure:this.onDelete,
      method:'DELETE'
    })
  }

  onDelete(){
    console.log("User account deleted. Ready to try again.")
  }

  createTaxes(){
    for (let i in defaultTaxes){
      let taxData = {
        name: defaultTaxes[i]['name'],
        price_per_kg: defaultTaxes[i]['price'],
        category: defaultTaxes[i]['category'],
        isDefault: "True",
      }

      apiFetch({
        method:'POST',
        url:api.MY_TAXES,
        data:taxData,
        onSuccess:this.props.onSuccess,
        onFailure:this.createProfileFailure,
      })
    }
  }

  render(){
    let title = <div>Sign Up</div>

    let body = 
      <form>
        <h5>Account</h5>
        <UsernameInput
          value={this.state.username}
          isValid={this.state.validUsername}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setValidUsername}
          className="my-2"
        />
        <PasswordInput
          value={this.state.password}
          isValid={this.state.strongPassword}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setStrongPassword}
          className="my-2"
        />
        <PasswordCheckInput
          value={this.state.password_check}
          checkValue={this.state.password}
          isValid={this.state.passwordsMatch}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setPasswordsMatch}
          className="my-2"
        />
        <EmailInput
          value={this.state.email}
          isValid={this.state.validEmail}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setValidEmail}
          className="my-2"
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
          maxLength={MAX_LEN_NAME}
          className="form-control my-2"
        />
        <input
          type="text"
          name="lastName"
          onChange={this.handleChange}
          placeholder="Last name"
          maxLength={MAX_LEN_NAME}
          className="form-control my-2"
        />
        <GoogleAutocomplete
          id="locationAutocomplete"
          name="location"
          placeholder="Location"
          maxLength={MAX_LEN_NAME}
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
        <button className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Cancel</button>
        <button className={`btn btn-success m-2 ${this.state.submissionPending ? "disabled":""}`} onClick={this.validateUserData}>Create account</button>
      </div>

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
  }
}