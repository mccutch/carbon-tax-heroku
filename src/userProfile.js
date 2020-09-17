import React from 'react';
import {Modal} from 'react-bootstrap';
import { TaxTable, VehicleTable, EmissionTable, PaymentTable } from './userTables.js';
import { fetchObject, getCurrencyFactor } from './helperFunctions.js';
import * as units from './unitConversions';
import { ObjectSelectionList, CurrencySelection, StandardModal, CurrencySymbolSelection, DisplayUnitSelection, FormRow } from './reactComponents.js';
import { PasswordInput, PasswordCheckInput, EmailInput, validateUsernameRegex, validateEmailRegex } from './validation.js';
import * as validation from './validation.js';
import { LinePlot, Histogram } from './dataVisuals.js';
import {TabbedDisplay} from './reactComponents.js';
import {GoogleAutocomplete} from './googleAutocomplete.js';
import {POSITION_DECIMALS, MAX_LEN_NAME} from './constants.js';

class PasswordChange extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      errorMessage:"",
      strongPassword:false,
      passwordsMatch:false,
      new_password:"",
      password_check:"",
      submitted:false,
    }
    this.handleChange=this.handleChange.bind(this)
    this.submit=this.submit.bind(this)
    this.handleResponse=this.handleResponse.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.returnError=this.returnError.bind(this)

    this.setStrongPassword=this.setStrongPassword.bind(this)
    this.setPasswordsMatch=this.setPasswordsMatch.bind(this)
  }

  setStrongPassword(bool){this.setState({strongPassword:bool})}
  setPasswordsMatch(bool){this.setState({passwordsMatch:bool})}

  returnError(errorMessage){
    this.setState({
      errorMessage:errorMessage,
      submissionPending:false,
    })
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  submit(event){
    event.preventDefault()
    this.setState({
      submissionPending:true,
      submitted:true,
      errorMessage:"",
    })
    
    if(!this.state.old_password || !this.state.new_password || !this.state.password_check){
      this.returnError("Fill in all fields.")
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
    
    let passwordData = {
      old_password:this.state.old_password,
      new_password:this.state.new_password,
    }

    fetchObject({
      url:"/account/update-password/",
      method:"PUT",
      data:passwordData,
      onSuccess:this.handleResponse,
      onFailure:this.updateFailure,
    })
  }

  handleResponse(json){
    let title=<div>Password changed</div>
    let body=<p>Password changed successfully.</p>
    let footer=<button className="btn btn-outline-success m-2" onClick={this.props.hideModal}>Close</button>
    this.props.setModal(<StandardModal title={title} body={body} footer={footer} hideModal={this.props.hideModal}/>)
  }

  updateFailure(json){
    this.returnError("Unable to change password.")
  }

  render(){
    let title=<div>Change Password</div>

    let body =
      <form>
        <p><strong>{this.state.errorMessage}</strong></p>
        <input 
          type="password" 
          name="old_password" 
          placeholder="Old password"
          onChange={this.handleChange}
          className="form-control my-2"
        />
        <PasswordInput
          value={this.state.new_password}
          name="new_password"
          isValid={this.state.strongPassword}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setStrongPassword}
          className="my-2"
        />
        <PasswordCheckInput
          value={this.state.password_check}
          checkValue={this.state.new_password}
          isValid={this.state.passwordsMatch}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={this.setPasswordsMatch}
          className="my-2"
        />
      </form>

    let footer = 
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button type="submit" className={`btn btn-success m-2 ${this.state.submissionPending ? "disabled":""}`} onClick={this.submit}>Submit</button>
      </div>

    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.hideModal}/>
  }
}

class DeleteUser extends React.Component{
  constructor(props){
    super(props)
    this.state={
      confirmDelete:false,
      errorMessage:""
    }
    this.handleClick=this.handleClick.bind(this)
    this.deleteUserAccount=this.deleteUserAccount.bind(this)
    this.deleteSuccess=this.deleteSuccess.bind(this)
    this.deleteFailure=this.deleteFailure.bind(this)
  }

  handleClick(event){
    if(event.target.name==="delete"){
      this.setState({confirmDelete:true})
    } else if(event.target.name==="cancel"){
      this.setState({confirmDelete:false})
    } else if(event.target.name==="confirm"){
      this.deleteUserAccount()
    }
  }

  deleteUserAccount(){
    let key = this.props.user.id

    fetchObject({
      url:`/user/${key}/`,
      onSuccess:this.deleteSuccess,
      onFailure:this.deleteFailure,
      method:'DELETE'
    })
  }

  deleteSuccess(){
    console.log("Delete successful.")
    this.setState({
      errorMessage:"User deleted successfully"
    })
    this.props.logout()
  }

  deleteFailure(){
    this.setState({
      error:"Unable to delete account."
    })
  }

  render(){
    let display
    if(!this.state.confirmDelete){
      display = <button className="btn btn-outline-dark m-2" name="delete" onClick={this.handleClick} >Delete account</button>
    } else {
      display = 
        <div>
          <h4>Delete this account?</h4>
          <p>All stored data will be removed from the server and cannot be recovered.</p>
          <p>{this.state.errorMessage}</p>
          <button className="btn btn-info m-2" name="cancel" onClick={this.handleClick} >Cancel</button>
          <button className="btn btn-danger m-2" name="confirm" onClick={this.handleClick} >Delete account</button>
        </div>
    }

    return display 
  }
}

class ProfileEdit extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      errorMessage:"",
      submissionPending:false,
      submitted:false,
      validEmail:true,
    }

    this.handleChange=this.handleChange.bind(this)
    this.setConversionFactor=this.setConversionFactor.bind(this)
    this.saveProfileChanges=this.saveProfileChanges.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.userUpdateSuccess=this.userUpdateSuccess.bind(this)
    this.profileUpdateSuccess=this.profileUpdateSuccess.bind(this)
    this.finishEdit=this.finishEdit.bind(this)
    this.validateInputs=this.validateInputs.bind(this)
    this.uniqueResponse=this.uniqueResponse.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.returnError=this.returnError.bind(this)
    this.setValidEmail=this.setValidEmail.bind(this)
  }

  setValidEmail(bool){this.setState({validEmail:bool})}

  handleChange(event){
    this.setState({[event.target.name]: event.target.value})

    if(event.target.name==="currency"){
      getCurrencyFactor({currency:event.target.value, onSuccess:this.setConversionFactor})
    } else if(event.target.name==="email"){
      this.setState({validEmail: validateEmailRegex(event.target.value)})
    }
  }

  returnError(errorMessage){
    this.setState({
      errorMessage:errorMessage,
      submissionPending:false,
    })
  }

  setConversionFactor(factor){
    this.setState({conversion_factor:factor})
  }

  validateInputs(){
    this.setState({
      errorMessage:"",
      submissionPending:true,
      submitted:true,
    })
    if(this.state.email && !this.state.validEmail){
      this.returnError(validation.EMAIL_ERR)
      return
    }

    if(this.state.email && this.state.email!==this.props.user.email){
      validation.checkUniqueUser({
        username:this.props.user.username,
        email:this.state.email,
        onSuccess:this.uniqueResponse,
        onFailure:this.updateFailure,
      })
    } else {
      this.saveProfileChanges()
    }
  }

  uniqueResponse(json){
    console.log(json)
    if(json.uniqueEmail===false){
      this.returnError("Email is already in use.")
      this.setState({validEmail:false})
    } else {
      this.saveProfileChanges()
    }
  }

  saveProfileChanges(){
    let profileData = {}
    let userData = {}

    let userAttributes = ["first_name", "last_name", "email"]
    let profileAttributes = ["date_of_birth", "location", "currency", "currency_symbol", "display_units", "conversion_factor"]
    
    for(let i in userAttributes){
      if(this.state[userAttributes[i]]){
        userData[userAttributes[i]]=this.state[userAttributes[i]]
      }
    }
    for(let i in profileAttributes){
      if(this.state[profileAttributes[i]]){
        profileData[profileAttributes[i]]=this.state[profileAttributes[i]]
      }
    }
    if(this.state.locationData){
      profileData['loc_lat']=parseFloat(this.state.locationData.lat).toFixed(POSITION_DECIMALS)
      profileData['loc_lng']=parseFloat(this.state.locationData.lng).toFixed(POSITION_DECIMALS)
    }

    if(Object.keys(profileData).length===0 && Object.keys(userData).length===0){
      this.props.hideModal()
    }

    if(Object.keys(userData).length>0){
      this.setState({updatingUser:true})
      console.log("Updating user")
      console.log(userData)
      let key = this.props.user.id

      fetchObject({
        url:`/user/${key}/`,
        method:'PATCH',
        data:userData,
        onSuccess:this.userUpdateSuccess,
        onFailure:this.updateFailure,
      })
    }

    if(Object.keys(profileData).length>0){
      this.setState({updatingProfile:true})
      console.log("Updating profile")
      console.log(profileData)
      let key = this.props.profile.id

      fetchObject({
        url:`/profile/${key}/`,
        method:'PATCH',
        data:profileData,
        onSuccess:this.profileUpdateSuccess,
        onFailure:this.updateFailure,
      })
    }
  }

  updateFailure(){
    this.returnError("Failed to update.")
  }

  userUpdateSuccess(){
    this.setState({
      updatingUser:false,
      firstName:null,
      lastName:null,
      email:null,
    }, this.finishEdit)
  }

  profileUpdateSuccess(){
    this.setState({
      updatingProfile:false,
      location:null,
      dateOfBirth:null,
      currency:null,
      currency_symbol:null,
      display_units:null,
      conversion_factor:null,
    }, this.finishEdit)
  }

  finishEdit(){
    /* PATCH on user and profile are separate, so check that both are complete. */ 
    if(!this.state.updatingProfile && !this.state.updatingUser){
      this.props.refresh()
      this.props.hideModal()
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
    let user=this.props.user
    let profile=this.props.profile

    let title = <div>Edit Profile</div>
    let body = 
      <form>
        <div className="form-row">
          <div className="col-4">
            <input type="text" name="first_name" defaultValue={user.first_name} placeholder="First name" onChange={this.handleChange} maxLength={MAX_LEN_NAME} className="form-control my-2"/>
          </div>
          <div className="col">
            <input type="text" name="last_name" defaultValue={user.last_name} placeholder="Last name" onChange={this.handleChange} maxLength={MAX_LEN_NAME} className="form-control my-2"/>
          </div>
        </div>
        <FormRow
          label={<div>Email:</div>}
          labelWidth={2}
          input={
            <EmailInput
              value={this.state.email}
              defaultValue={this.props.user.email}
              isValid={this.state.validEmail}
              submitted={this.state.submitted}
              onChange={this.handleChange}
              returnValidation={this.setValidEmail}
              className="my-2"
            />
          }
        />
        <FormRow
          label={<div>Location:</div>}
          labelWidth={2}
          input={
            <GoogleAutocomplete
              id="locationAutocomplete"
              name="location"
              placeholder="Location"
              defaultValue={profile.location}
              maxLength={MAX_LEN_NAME}
              className={`form-control my-2 ${this.state.locationData ? "is-valid" : ""}`}
              returnPlace={this.handleLocationData}
              onChange={this.handleChange}
            />
          }
        />
        <FormRow
          label={<div>DoB:</div>}
          labelWidth={2}
          input={<input type="date" name="date_of_birth" defaultValue={profile.date_of_birth} onChange={this.handleChange} className="form-control my-2"/>}
        />
        <FormRow
          label={<div>Currency:</div>}
          labelWidth={2}
          input={
            <div className="form-row">
              <div className="col-9">
                <CurrencySelection name="currency" defaultValue={profile.currency} onChange={this.handleChange} />
              </div>
              <div className="col">
                <CurrencySymbolSelection name="currency_symbol" defaultValue={profile.currency_symbol} onChange={this.handleChange} />
              </div>
            </div>
          }
        />
        <FormRow
          label={<div>Units:</div>}
          labelWidth={2}
          input={<DisplayUnitSelection name="display_units" defaultValue={profile.display_units} onChange={this.handleChange} />}
        />
        <DeleteUser user={user} logout={this.props.logout}/>
        <p><strong>{this.state.errorMessage}</strong></p>
      </form>

    let footer = 
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button name="saveChanges" className={`btn btn-success m-2 ${this.state.submissionPending ? "disabled":""}`} onClick={this.validateInputs}>Save changes</button>
      </div>
    
    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.hideModal} />
  }
}



class ProfileDetails extends React.Component{
  constructor(props){
    super(props)

    this.changePassword=this.changePassword.bind(this)
    this.editProfile=this.editProfile.bind(this)
  }

  changePassword(){
    let modal = 
      <PasswordChange
        hideModal={this.props.hideModal}
        setModal={this.props.setModal}
      />
    this.props.setModal(modal)
  }

  editProfile(){
    let modal = 
      <ProfileEdit
        user={this.props.user} 
        profile={this.props.profile}
        refresh={this.props.refresh} 
        logout={this.props.logout}
        hideModal={this.props.hideModal}
      />
    this.props.setModal(modal)
  }
  
  render(){
    let user=this.props.user
    let profile=this.props.profile

    return(
      <div className="row">
        <div className="col-sm">
          <p>Name: {user.first_name} {user.last_name}</p>
          <p>Location: {profile.location}</p>
          <p>Date of Birth: {profile.date_of_birth}</p>
          <p>Email: {user.email}</p>
          <p>Currency: {profile.currency} ({profile.currency_symbol})</p>
          <p>Units: {units.string(profile.display_units)}</p>
        </div>
        <div className="col-sm">
          <button name="editProfile" className="btn btn-outline-dark m-2" onClick={this.editProfile}>Edit profile</button>
          <br/>
          <button name="changePassword" className="btn btn-outline-dark m-2" onClick={this.changePassword}>Change password</button>
        </div>
      </div>
    )
  }
}



export class HistoryLists extends React.Component{
  render(){
    let emissions = <EmissionTable 
                      refresh={this.props.refresh} 
                      emissions={this.props.emissions} 
                      displayUnits={this.props.displayUnits} 
                      taxes={this.props.taxes} 
                      profile={this.props.profile}
                      setModal={this.props.setModal}
                      hideModal={this.props.hideModal}
                      fuels={this.props.fuels}
                    />
    let payments = <PaymentTable 
                      refresh={this.props.refresh} 
                      payments={this.props.payments} 
                      displayUnits={this.props.displayUnits} 
                      recipients={this.props.recipients} 
                      profile={this.props.profile}
                      setModal={this.props.setModal}
                      hideModal={this.props.hideModal}
                    />

    let tabData = [
      {
        label: "Emissions",
        display: emissions,
      },
      {
        label: "Payments",
        display: payments,
      }
    ]
    return <TabbedDisplay style="nav-tabs" tabData={tabData} />
  }
}

class SettingsLists extends React.Component{
  render(){
    let taxTable = 
      <TaxTable 
        refresh={this.props.refresh} 
        taxes={this.props.taxes} 
        profile={this.props.profile}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
        addNew={true}
      />
    let vehicleTable = 
      <VehicleTable 
        refresh={this.props.refresh} 
        vehicles={this.props.vehicles} 
        displayUnits={this.props.displayUnits} 
        fuels={this.props.fuels}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
        addNew={true}
      />

    let tabData = [
      {
        label: "My Taxes",
        display: taxTable,
      },
      {
        label: "My Vehicles",
        display: vehicleTable,
      },
    ]
    return <TabbedDisplay style="nav-tabs" tabData={tabData} />
  }
}


export class ProfileDisplay extends React.Component{
  constructor(props){
    super(props)

    this.state={
      profile:{},
    }
  }

  componentDidMount(){
    this.props.refresh()
  }

  render(){
    return(

      <div>
        <ProfileDetails 
          user={this.props.user} 
          profile={this.props.profile} 
          stats={this.props.stats}
          refresh={this.props.refresh}
          logout={this.props.logout}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
        
        <SettingsLists
          refresh={this.props.refresh}
          taxes={this.props.taxes}
          vehicles={this.props.vehicles}
          fuels={this.props.fuels}
          displayUnits={this.props.displayUnits}
          profile={this.props.profile}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />

      </div>
    )
  }
}