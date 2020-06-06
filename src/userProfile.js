import React from 'react';
import { TaxTable, VehicleTable, EmissionTable } from './userTables.js';
import { fetchObject } from './helperFunctions.js';
import * as units from './unitConversions';
import { ObjectSelectionList, CurrencySelection } from './reactComponents.js';

const MAX_PASSWORD_LEN = 30
const MAX_NAME_LEN = 30

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
      errorMessage:null,
    }

    this.handleClick=this.handleClick.bind(this)
    this.saveProfileChanges=this.saveProfileChanges.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.userUpdateSuccess=this.userUpdateSuccess.bind(this)
    this.profileUpdateSuccess=this.profileUpdateSuccess.bind(this)
  }

  handleClick(event){
    if(event.target.name==="editProfile"){
      this.setState({editProfile:true})
    } else if(event.target.name==="cancelEdit"){
      this.setState({
        editProfile:false,
        firstName:null,
        lastName:null,
        location:null,
        dateOfBirth:null,
        errorMessage:null,
        email:null,
        currency:null,
        currency_symbol:null,
        display_units:null,
      })
    } else if(event.target.name==="saveChanges"){
      this.saveProfileChanges()
    }
  }

  handleChange(event){
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  saveProfileChanges(){
    let profileData = {}
    let userData = {}

    /*
    if(this.state.firstName){
      userData["first_name"]=this.state.firstName
    }
    if(this.state.lastName){
      userData["last_name"]=this.state.lastName
    }
    if(this.state.email){
      userData["email"]=this.state.email
    }
    
    if(this.state.location){
      profileData["location"]=this.state.location
    }
    if(this.state.dateOfBirth){
      profileData["date_of_birth"]=this.state.dateOfBirth
    }
    */

    let userAttributes = ["first_name", "last_name", "email"]
    for(let i in userAttributes){
      if(this.state[userAttributes[i]]){
        userData[userAttributes[i]]=this.state[userAttributes[i]]
      }
    }

    let profileAttributes = ["date_of_birth", "location", "currency", "currency_symbol", "display_units"]

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
        })
        this.props.refresh()
  }

  profileUpdateSuccess(){
    this.setState({
      editProfile:false,
      errorMessage:null,
      location:null,
      dateOfBirth:null,
    })
    this.props.refresh()
  }


  render(){
    let user=this.props.user
    let profile=this.props.profile




    let profileDisplay
    if(this.state.editProfile){
      profileDisplay=
        <div>
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
              <CurrencySelection defaultValue={profile.currency} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Currency symbol:
              <input type="text" size="1" maxLength="1" name="currency_symbol" defaultValue={profile.currency_symbol} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Economy units:
              <ObjectSelectionList name="display_units" list={units.allUnits} defaultValue={profile.display_units} value="str" label="label" onChange={this.handleChange}/>
            </label>
          </form>
          <p>{this.state.errorMessage}</p>
          <button name="saveChanges" className="btn btn-outline-primary" onClick={this.handleClick}>Save changes</button>
          <button name="cancelEdit" className="btn btn-outline-danger" onClick={this.handleClick}>Cancel</button>
        </div>
    } else {
      profileDisplay=
        <div>
          <p>Name: {user.first_name} {user.last_name}</p>
          <p>Location: {profile.location}</p>
          <p>Date of Birth: {profile.date_of_birth}</p>
          <p>Email: {user.email}</p>
          <p>Currency: {profile.currency} ({profile.currency_symbol})</p>
          <p>Units: {units.string(profile.display_units)}</p>
          <button name="editProfile" className="btn btn-outline-dark" onClick={this.handleClick}>Edit profile</button>
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
      table = <EmissionTable emissions={this.props.emissions} displayUnits={this.props.displayUnits} taxes={this.props.taxes} profile={this.props.profile}/>
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