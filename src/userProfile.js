import React from 'react';
import {Modal} from 'react-bootstrap';
import { TaxTable, VehicleTable, EmissionTable, PaymentTable } from './userTables.js';
import { fetchObject, getCurrencyFactor } from './helperFunctions.js';
import * as units from './unitConversions';
import { ObjectSelectionList, CurrencySelection } from './reactComponents.js';
import { checkPasswordStrength, validateUsernameRegex, validateEmailRegex } from './validation.js';
import * as validation from './validation.js';
import { MAX_PASSWORD_LEN, MAX_EMAIL_LEN, MAX_NAME_LEN } from './validation.js';
import { LinePlot, Histogram } from './dataVisuals.js';
import {TabbedDisplay} from './reactComponents.js';

class PasswordChange extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      errorMessage:"",
      strongPassword:false,
    }
    this.handleChange=this.handleChange.bind(this)
    this.submit=this.submit.bind(this)
    this.handleResponse=this.handleResponse.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="new_password"){
      this.setState({strongPassword:checkPasswordStrength(event.target.value)})
    }
  }

  submit(event){
    event.preventDefault()
    if(!this.state.old_password || !this.state.new_password || !this.state.confirm_password){
      this.setState({errorMessage:"Fill in all fields."})
      return
    }

    // Validate password
    if(this.state.new_password !== this.state.confirm_password){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      this.setState({errorMessage:validation.PASSWORD_ERR})
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
    this.setState({success:true})
  }

  updateFailure(json){
    this.setState({
      errorMessage:"Unable to change password."
    })
  }

  render(){

    let display
    if(this.state.success){
      display=
        <Modal show={true} onHide={this.props.hideModal}>
          <Modal.Header className="bg-primary text-light" closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Password changed successfully.</p>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-outline-success m-2" onClick={this.props.hideModal}>Close</button>
          </Modal.Footer>
        </Modal>
    } else {
      display = 
      <Modal show={true} onHide={this.props.hideModal} size="sm">
        <Modal.Header className="bg-primary text-light" closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <p><strong>{this.state.errorMessage}</strong></p>
            <input type="password" name="old_password" placeholder="Old password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
            <br/>
            <input type="password" name="new_password" placeholder="New password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
            <br/>
            <input type="password" name="confirm_password" placeholder="Confirm password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button type="submit" className="btn btn-primary m-2" onClick={this.submit}>Submit</button>
          <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        </Modal.Footer>
      </Modal>
    }

    return display
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
  }

  handleChange(event){
    this.setState({[event.target.name]: event.target.value})

    if(event.target.name==="currency"){
      getCurrencyFactor({currency:event.target.value, onSuccess:this.setConversionFactor})
    } else if(event.target.name==="email"){
      this.setState({validEmail: validateEmailRegex(event.target.value)})
    }
  }

  setConversionFactor(factor){
    this.setState({conversion_factor:factor})
  }

  validateInputs(){
    if(this.state.email && !this.state.validEmail){
      this.setState({errorMessage: validation.EMAIL_ERR})
      return
    }

    if(this.state.email && this.state.email!==this.props.user.email){
      let data = {
        username:this.props.user.username,
        email:this.state.email,
      }
      fetchObject({
        method:'POST',
        url:'/registration/check-unique/',
        data:data,
        onSuccess:this.uniqueResponse,
        onFailure:this.updateFailure,
        noAuth:true,
      })

    } else {
      this.saveProfileChanges()
    }
  }

  uniqueResponse(json){
    console.log(json)
    if(json.uniqueEmail===false){
      this.setState({errorMessage:"Email is already in use."})
    } else {
      this.saveProfileChanges()
    }
  }

  saveProfileChanges(){
    

    this.setState({errorMessage:""})
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
    this.setState({
      errorMessage:"Failed to update."
    })
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


  render(){

    let user=this.props.user
    let profile=this.props.profile

    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header className="bg-primary text-light" closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <label>
              First name:
              <input type="text" name="first_name" defaultValue={user.first_name} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Last name:
              <input type="text" name="last_name" defaultValue={user.last_name} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Location:
              <input type="text" name="location" defaultValue={profile.location} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Date of birth:
              <input type="date" name="date_of_birth" defaultValue={profile.date_of_birth} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Email:
              <input type="text" name="email" defaultValue={user.email} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Currency:
              <CurrencySelection name="currency" defaultValue={profile.currency} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Currency symbol:
              <input type="text" size="3" maxLength="3" name="currency_symbol" defaultValue={profile.currency_symbol} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Economy units:
              <ObjectSelectionList name="display_units" list={units.allUnits} defaultValue={profile.display_units} value="str" label="label" onChange={this.handleChange}/>
            </label>
            <br/>
            <p><strong>{this.state.errorMessage}</strong></p>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button name="saveChanges" className="btn btn-primary m-2" onClick={this.validateInputs}>Save changes</button>
          <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
          <DeleteUser user={user} logout={this.props.logout}/>
        </Modal.Footer>
      </Modal>
    )
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
        <div className="col-sm-5 bg-light mx-2 my-2">
          <p>Name: {user.first_name} {user.last_name}</p>
          <p>Location: {profile.location}</p>
          <p>Date of Birth: {profile.date_of_birth}</p>
          <p>Email: {user.email}</p>
          <p>Currency: {profile.currency} ({profile.currency_symbol})</p>
          <p>Units: {units.string(profile.display_units)}</p>
          <button name="editProfile" className="btn btn-outline-dark m-2" onClick={this.editProfile}>Edit profile</button>
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
      />
    let vehicleTable = 
      <VehicleTable 
        refresh={this.props.refresh} 
        vehicles={this.props.vehicles} 
        displayUnits={this.props.displayUnits} 
        fuels={this.props.fuels}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
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