import React from 'react';
import { TaxTable, VehicleTable, EmissionTable } from './userTables.js';
import { fetchObject, convertCurrency } from './helperFunctions.js';
import * as units from './unitConversions';
import { ObjectSelectionList, CurrencySelection } from './reactComponents.js';

const MAX_PASSWORD_LEN = 30
const MAX_NAME_LEN = 30

class PasswordChange extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      errorMessage:"",
      strongPassword:false,
    }
    this.cancel=this.cancel.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.checkPasswordStrength=this.checkPasswordStrength.bind(this)
    this.submit=this.submit.bind(this)
    this.handleResponse=this.handleResponse.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
  }

  cancel(event){
    event.preventDefault()
    this.props.cancel(event)
  }

  handleChange(event){
    //event.preventDefault()
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name=="new_password"){
      this.checkPasswordStrength(event.target.value)
    }
  }

  checkPasswordStrength(password){
    //const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*])(?=.{8,})") 
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
    this.setState({strongPassword:strongRegex.test(password)})
  }

  submit(event){
    event.preventDefault()
    if(!this.state.old_password || !this.state.new_password || !this.state.confirm_password){
      this.setState({errorMessage:"Fill in required fields."})
      return
    }

    // Validate password
    if(this.state.new_password !== this.state.confirm_password){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      //this.setState({errorMessage:"Password must be 8-30 characters, including a number and special character (?!@#$%^&)"})
      this.setState({errorMessage:"Password must be 8-30 characters, including a capital letter and a number"})
      return
    }

    let passwordData = {
      old_password:this.state.old_password,
      new_password:this.state.new_password,
    }

    //console.log(passwordData)

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
        <div>
          <p>Password changed successfully.</p>
          <button name="cancelEdit" className="btn btn-outline-success" onClick={this.cancel}>Return to profile.</button>
        </div>
    } else {
      display = 
        <form>
          <p>{this.state.errorMessage}</p>
          <input type="password" name="old_password" placeholder="Old password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
          <br/>
          <input type="password" name="new_password" placeholder="New password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
          <br/>
          <input type="password" name="confirm_password" placeholder="Confirm password" maxLength={MAX_PASSWORD_LEN} onChange={this.handleChange}/>
          <br/>
          <button type="submit" className="btn btn-outline-primary" onClick={this.submit}>Submit</button>
          <button name="cancelEdit" className="btn btn-outline-danger" onClick={this.cancel}>Cancel</button>
        </form>
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
    let key = parseInt(this.props.user.id).toString()

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
      display = <button className="btn btn-outline-danger" name="delete" onClick={this.handleClick} >Delete account</button>
    } else {
      display = 
        <div>
          <h4>Delete this account?</h4>
          <p>All stored data will be removed from the server and cannot be recovered.</p>
          <p>{this.state.errorMessage}</p>
          <button className="btn btn-info" name="cancel" onClick={this.handleClick} >Cancel</button>
          <button className="btn btn-danger" name="confirm" onClick={this.handleClick} >Confirm</button>
        </div>
    }

    return(
      <div>
        {display}
      </div>
    )
  }
}





class ProfileDetails extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      editProfile:false,
      changePassword:false,
      errorMessage:null,
    }

    this.handleClick=this.handleClick.bind(this)
    this.saveProfileChanges=this.saveProfileChanges.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.userUpdateSuccess=this.userUpdateSuccess.bind(this)
    this.profileUpdateSuccess=this.profileUpdateSuccess.bind(this)
    this.convertCurrency=this.convertCurrency.bind(this)
    this.setConversionFactor=this.setConversionFactor.bind(this)
  }

  handleClick(event){
    if(event.target.name==="editProfile"){
      this.setState({editProfile:true})
    } else if(event.target.name==="cancelEdit"){
      this.setState({
        editProfile:false,
        changePassword:false,
        firstName:null,
        lastName:null,
        location:null,
        dateOfBirth:null,
        errorMessage:null,
        email:null,
        currency:null,
        currency_symbol:null,
        display_units:null,
        conversion_factor:null,
      })
    } else if(event.target.name==="saveChanges"){
      this.saveProfileChanges()
    } else if(event.target.name==="changePassword"){
      this.setState({changePassword:true})
    }
  }

  handleChange(event){
    this.setState({
      [event.target.name]: event.target.value
    })
    if(event.target.name==="currency"){
      this.convertCurrency(event.target.value)
    }
  }

  convertCurrency(CUR){
    console.log("convert")
    convertCurrency({
      convertFrom:"AUD",
      convertTo:CUR,
      amount:1,
      onSuccess:this.setConversionFactor,
    })
  }

  setConversionFactor(factor){
    this.setState({conversion_factor:factor})
  }

  saveProfileChanges(){
    let profileData = {}
    let userData = {}

    let userAttributes = ["first_name", "last_name", "email", "password"]
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

    if(Object.keys(userData).length>0){
      console.log("Updating user")
      console.log(userData)
      let key = parseInt(this.props.user.id).toString()

      fetchObject({
        url:`/user/${key}/`,
        method:'PATCH',
        data:userData,
        onSuccess:this.userUpdateSuccess,
        onFailure:this.updateFailure,
      })
    }
    

    if(Object.keys(profileData).length>0){
      console.log("Updating profile")

      let key = parseInt(this.props.profile.id).toString()

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
      editProfile:false,
      errorMessage:null,
      firstName:null,
      lastName:null,
      email:null,
      password:null,
    })
    this.props.refresh()
  }

  profileUpdateSuccess(){
    this.setState({
      editProfile:false,
      errorMessage:null,
      location:null,
      dateOfBirth:null,
      currency:null,
      currency_symbol:null,
      display_units:null,
      conversion_factor:null,
    })
    this.props.refresh()
  }


  render(){
    let user=this.props.user
    let profile=this.props.profile




    let profileDisplay
    if(this.state.changePassword){
      profileDisplay = <PasswordChange cancel={this.handleClick}/>
    } else if(this.state.editProfile){
      profileDisplay=
        <div className="container bg-light">
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
            <label>
              Password:
              <input type="password" name="password" onChange={this.handleChange}/>
            </label>
            <p><a href="/password_reset/">Reset Password</a></p>
          </form>
          <p>{this.state.errorMessage}</p>
          <button name="saveChanges" className="btn btn-outline-primary" onClick={this.handleClick}>Save changes</button>
          <button name="cancelEdit" className="btn btn-outline-danger" onClick={this.handleClick}>Cancel</button>
        </div>
    } else {
      profileDisplay=
        <div className="row">
          <div className="col-sm-5 bg-light mx-2 my-2">
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Location: {profile.location}</p>
            <p>Date of Birth: {profile.date_of_birth}</p>
            <p>Email: {user.email}</p>
            <p>Currency: {profile.currency} ({profile.currency_symbol})</p>
            <p>Units: {units.string(profile.display_units)}</p>
            <button name="editProfile" className="btn btn-outline-dark" onClick={this.handleClick}>Edit profile</button>
            <button name="changePassword" className="btn btn-outline-dark" onClick={this.handleClick}>Change password</button>
          </div>
          <div className="col-sm-5 bg-light mx-2 my-2">
            <h4>Dashboard</h4>
          </div>
        </div>
    }


    return(
      <div>
        <h3>{user.username}</h3>
        {profileDisplay}
      </div>
    )
  }
}

class TabbedListDisplay extends React.Component{
  constructor(props){
    super(props)

    this.state={
      activeTab:"taxes",
    }

    this.makeTab=this.makeTab.bind(this)
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log(event.target.name)
    this.setState({
      activeTab:event.target.name
    })
  }

  makeTab(name, label){
    let className
    if(this.state.activeTab === name){
      className="nav-link active"
    } else {
      className="nav-link"
    }
    return <strong><a name={name} className={className} onClick={this.handleClick}>{label}</a></strong>
  }

  render(){

    let table
    if(this.state.activeTab==="taxes"){
      table = <TaxTable refresh={this.props.refresh} taxes={this.props.taxes} profile={this.props.profile}/>
    } else if(this.state.activeTab==="vehicles"){
      table = <VehicleTable refresh={this.props.refresh} vehicles={this.props.vehicles} displayUnits={this.props.displayUnits} fuels={this.props.fuels}/>
    } else if(this.state.activeTab==="emissions"){
      table = <EmissionTable refresh={this.props.refresh} emissions={this.props.emissions} displayUnits={this.props.displayUnits} taxes={this.props.taxes} profile={this.props.profile}/>
    }

    return(
      <div className="container py-2">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            {this.makeTab("taxes", "My Taxes")}
          </li>
          <li className="nav-item">
            {this.makeTab("vehicles", "My Vehicles")}
          </li>
          <li className="nav-item">
            {this.makeTab("emissions", "My Emissions")}
          </li>
        </ul>
        {table}
      </div>
    )
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
          refresh={this.props.refresh}
        />
        <TabbedListDisplay 
          refresh={this.props.refresh}
          taxes={this.props.taxes}
          vehicles={this.props.vehicles}
          fuels={this.props.fuels}
          displayUnits={this.props.displayUnits}
          emissions={this.props.emissions}
          profile={this.props.profile}
        />
        
        <button name="hideProfile" className="btn btn-outline-success" onClick={this.props.onClick}>Hide profile</button>
        <button name="logout" className="btn btn-outline-danger" onClick={this.props.onClick}>Logout</button>
        <DeleteUser user={this.props.user} logout={this.props.logout}/>
      </div>
    )
  }
}