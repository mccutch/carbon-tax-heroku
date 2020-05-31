import React from 'react';
import {refreshToken} from './myJWT.js';
import { TaxTable, VehicleTable } from './userTables.js';
//import * as helper from './helperFunctions.js';
import { fetchObject } from './helperFunctions.js';


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
      display = <button className="btn-outline-danger" name="delete" onClick={this.handleClick} >Delete account</button>
    } else {
      display = 
        <div>
          <h4>Delete this account?</h4>
          <p>All stored data will be removed from the server and cannot be recovered.</p>
          <p>{this.state.errorMessage}</p>
          <button className="btn-info" name="cancel" onClick={this.handleClick} >Cancel</button>
          <button className="btn-danger" name="confirm" onClick={this.handleClick} >Confirm</button>
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

    if(Object.keys(userData).length>0){
      console.log("Updating user")
      console.log(userData)
      let key = parseInt(this.props.user.id).toString()

      fetchObject({
        url:`/user/${key}/`,
        method:'PUT',
        data:userData,
        onSuccess:this.userUpdateSuccess,
        onFailure:this.updateFailure,
      })
      /*
      fetch(`/user/${key}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer "+localStorage.getItem('access')
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
        console.log(json)
        this.setState({
          editProfile:false,
          errorMessage:null,
          firstName:null,
          lastName:null,
          email:null,
        })
        this.props.refresh()
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.saveProfileChanges})
        }
        this.setState({
          errorMessage:"Failed to update."
        })
      });
      */
    }
    

    if(Object.keys(profileData).length>0){
      console.log("Updating profile")

      let key = parseInt(this.props.profile.id).toString()

      fetchObject({
        url:`/profile/${key}/`,
        method:'PUT',
        data:profileData,
        onSuccess:this.profileUpdateSuccess,
        onFailure:this.updateFailure,
      })
      /*
      fetch(`/profile/${key}/`, {
        method: 'PUT',
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
        this.setState({
          editProfile:false,
          errorMessage:null,
          location:null,
          dateOfBirth:null,
        })
        this.props.refresh()
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.saveProfileChanges})
        }
        this.setState({
          errorMessage:"Failed to update."
        })
      }); 
      */ 
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
              <input type="text" name="firstName" defaultValue={user.first_name} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Last name:
              <input type="text" name="lastName" defaultValue={user.last_name} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Location:
              <input type="text" name="location" defaultValue={profile.location} placeholder="Undefined" onChange={this.handleChange} maxLength={MAX_NAME_LEN}/>
            </label>
            <br/>
            <label>
              Date of birth:
              <input type="date" name="dateOfBirth" defaultValue={profile.date_of_birth} onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Email:
              <input type="text" name="email" defaultValue={user.email} onChange={this.handleChange}/>
            </label>
          </form>
          <p>{this.state.errorMessage}</p>
          <button name="saveChanges" className="btn-outline-primary" onClick={this.handleClick}>Save changes</button>
          <button name="cancelEdit" className="btn-outline-danger" onClick={this.handleClick}>Cancel</button>
        </div>
    } else {
      profileDisplay=
        <div>
          <p>Name: {user.first_name} {user.last_name}</p>
          <p>Location: {profile.location}</p>
          <p>Date of Birth: {profile.date_of_birth}</p>
          <p>Email: {user.email}</p>
          <button name="editProfile" className="btn-outline-dark" onClick={this.handleClick}>Edit profile</button>
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
        <h4>My Taxes</h4> 
        <TaxTable refresh={this.props.refresh} taxes={this.props.taxes}/>

        <h4>My Vehicles</h4> 
        <VehicleTable refresh={this.props.refresh} vehicles={this.props.vehicles} displayUnits={this.props.displayUnits} fuels={this.props.fuels}/>
        <button name="hideProfile" className="btn-outline-success" onClick={this.props.onClick}>Hide profile</button>
        <button name="logout" className="btn-outline-danger" onClick={this.props.onClick}>Logout</button>
        <DeleteUser user={this.props.user} logout={this.props.logout}/>
      </div>
    )
  }
}