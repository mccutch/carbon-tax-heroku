import React from 'react';
import {refreshToken} from './myJWT.js';
import { defaultTaxes, taxCategories } from './defaultTaxTypes.js';
import { OptionListInput } from './optionListInput.js';
import * as helper from './helperFunctions.js';

const TAX_RATE_DECIMALS = 3

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
    fetch(`/user/${key}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
    })
    .then(res => {
        if(res.ok){
          //console.log(res)
          this.setState({
          errorMessage:"User deleted successfully"
          })
          this.props.logout()
        } else {
          throw new Error(res.status)
        }
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.deleteUserAccount})
        }
        this.setState({
          error:"Unable to delete account."
        })
      });

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

class CreateTax extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      createNew: false,
      newName: "",
      newPrice: 0,
      newCategory: "",
      categoryList:[],
    }

    this.buildCategoryList=this.buildCategoryList.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.handleSubmit=this.handleSubmit.bind(this)
    this.submitNewTax=this.submitNewTax.bind(this)
  }

  componentDidMount(){
    this.buildCategoryList()
  }

  buildCategoryList(){
    let categoryList=[]
    for(let i in taxCategories){
      categoryList.push(taxCategories[i]['title'])
    }
    this.setState({
      categoryList:categoryList,
      newCategory:categoryList[0]
    })
  }

  handleClick(event){
    if(event.target.name==="create"){
      this.setState({createNew:true})
    } else if(event.target.name==="cancel"){
      this.setState({
        createNew:false,
        newName:"",
        newPrice:0,
        newCategory: this.state.categoryList[0],
        error:false,
      })
    }
  }

  handleChange(event){
    this.setState({
      [event.target.name]:event.target.value
    })
  }

  handleSubmit(event){
    event.preventDefault()
    this.submitNewTax()
  }

  submitNewTax(){
    let taxData = {
      name: this.state.newName,
      price_per_kg: parseFloat(this.state.newPrice).toFixed(TAX_RATE_DECIMALS),
      category: this.state.newCategory,
    }

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
        this.setState({
          createNew:false,
          newName: null,
          newPrice: 0,
          error:false,
        })
        this.props.refreshTaxes()
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.submitNewTax})
        }
        this.setState({
          error:true
        })
      });
  }

  render(){

    let display
    if(this.state.createNew){
      display = 
        <div>
          <label>
            Name:
            <input type="text" name="newName" maxLength={MAX_NAME_LEN} onChange={this.handleChange}/>
          </label>
          <br/>
          <label>
            Price per kg:
            <input type="number" name="newPrice" onChange={this.handleChange}/>
          </label>
          <label>
            Category:
            <OptionListInput name="newCategory" list={this.state.categoryList} onChange={this.handleChange} />
          </label>
          <br/>
          <button type="button" className="btn-outline-primary" onClick={this.handleSubmit}>Submit</button>
          <button className="btn-outline-danger" name="cancel" onClick={this.handleClick}>Cancel</button>
        </div>
    } else {
      display = <button className="btn-outline-primary" name="create" onClick={this.handleClick}>Add a tax</button>
    }

    let errorDisplay
    if(this.state.error){
      errorDisplay=<p>{this.state.error}</p>
    }

    
    return(
      <div>
        {errorDisplay}
        {display}
      </div>
    )

  }
}


class TaxListItem extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
      newValue:this.props.tax.price_per_kg,
      error:false,
    }

    this.editTax=this.editTax.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.isDefaultTax=this.isDefaultTax.bind(this)
    this.deleteTax=this.deleteTax.bind(this)
  }

  deleteTax(){
    let key = parseInt(this.props.tax.id).toString()

    fetch(`/tax/${key}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
    })
    .then(res => {
      console.log(res)
      if(res.ok){
        this.props.refreshTaxes()
        this.setState({
          edit:false,
          error:false,
        })
      } else {
        throw new Error(res.status)
      }
    })
    .catch(error => {
      console.log(error.message)
      if(error.message==='401'){
        refreshToken({onSuccess:this.deleteTax})
      }
      this.setState({
        error:true
      })
    });
  }


  editTax(event){
    if(event.target.name==="cancel"){
      this.setState({edit:false})
    } else if(event.target.name==="edit"){
      this.setState({edit:true})
    }
  }

  validateInput(){
    if(this.state.newValue < 0){
      return false
    }

    return true
  }


  saveChange(){
    if(this.validateInput()){

      let key = parseInt(this.props.tax.id).toString()
      console.log(key)

      let taxData = {
        name: this.props.tax.name,
        price_per_kg: parseFloat(this.state.newValue).toFixed(TAX_RATE_DECIMALS),
      }

      fetch(`/tax/${key}/`, {
        method: 'PUT',
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
          this.setState({
            edit:false,
            newValue: this.props.tax.price_per_kg,
            error:false
          })
          this.props.refreshTaxes()
        })
        .catch(error => {
          console.log(error.message)
          if(error.message==='401'){
            refreshToken({onSuccess:this.saveChange})
          }
          this.setState({
            error:true
          })
        });
    } 
  }

  handleChange(event){
    this.setState({newValue:event.target.value})
  }

  render(){
    let tax = this.props.tax
    let editDisplay
    if(this.state.edit){

      let deleteButton
      if(!tax.isDefault){
        deleteButton = <button className="btn-outline-dark" name="delete" onClick={this.deleteTax}>Delete</button>
      }

      let existingValue=parseFloat(this.props.tax.price_per_kg)
      editDisplay = 
        <td>
          <input type="number" defaultValue={existingValue.toFixed(TAX_RATE_DECIMALS)} onChange={this.handleChange} step="0.01"/>
          <button className="btn-outline-primary" name="save" onClick={this.saveChange}>Save</button>
          {deleteButton}
          <button className="btn-outline-danger" name="cancel" onClick={this.editTax}>Cancel</button>
        </td>
    } else {
      editDisplay = 
        <td>
          <button className="btn-outline-warning" name="edit" onClick={this.editTax}>Edit</button>
        </td>
    }

    return(
      <tr key={tax.id}>
        <td>{tax.name}</td>
        <td>${parseFloat(tax.price_per_kg).toFixed(TAX_RATE_DECIMALS)}/kg CO2</td>
        <td>{tax.category}</td>
        {editDisplay}
      </tr>
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
        this.props.refreshUser()
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
    }

    if(Object.keys(profileData).length>0){
      console.log("Updating profile")

      let key = parseInt(this.props.profile.id).toString()

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
        this.props.refreshProfile()
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
    }
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
    this.makeTaxTable=this.makeTaxTable.bind(this)
  }

  makeTaxTable(){
    let taxes = this.props.taxes
    let tableRows=[]
    if(taxes){
      for(let i=0; i<taxes.length; i++){
        tableRows.push(<TaxListItem key={taxes[i].id} tax={taxes[i]} refreshTaxes={this.props.refreshTaxes}/>)
      }
    }
    return( 
      <table className="table table-light">
        <thead className="thead-dark">
          <tr>
            <th>Name</th>
            <th>Price/kg CO2</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    )
  }

  componentDidMount(){
    this.props.refreshProfile()
  }

  render(){
    let taxTable = this.makeTaxTable()

    return(
      <div>
        <ProfileDetails user={this.props.user} profile={this.props.profile} refreshProfile={this.props.refreshProfile} refreshUser={this.props.refreshUser}/>
        <h4>My Taxes</h4>
        {taxTable}
        <CreateTax refreshTaxes={this.props.refreshTaxes}/>
        <button name="hideProfile" className="btn-outline-success" onClick={this.props.onClick}>Hide profile</button>
        <button name="logout" className="btn-outline-danger" onClick={this.props.onClick}>Logout</button>
        <DeleteUser user={this.props.user} logout={this.props.logout}/>
      </div>
    )
  }
}