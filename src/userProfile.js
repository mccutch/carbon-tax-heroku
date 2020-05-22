import React from 'react';
import {refreshToken} from './myJWT.js';
import { defaultTaxes, taxCategories } from './defaultTaxTypes.js';

const TAX_RATE_DECIMALS = 3


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
    this.submitNewTax=this.submitNewTax.bind(this)
    this.renderCategoryOptions=this.renderCategoryOptions.bind(this)
  }

  componentDidMount(){
    this.buildCategoryList()
  }

  buildCategoryList(){
    console.log("buillidng list")
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

  submitNewTax(event){
    event.preventDefault()

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
          refreshToken({onSuccess:this.fetchUserProfile})
        }
        this.setState({
          error:true
        })
      });
  }

  renderCategoryOptions() {
    let list = this.state.categoryList;
    let listOptions = [];
    for(let i=0; i<list.length; i++){
      listOptions.push(<option 
                          value={list[i]}
                          key = {i}
                        >
                        {list[i]}</option>)
    }
    return  <select
              onChange = {this.handleChange}
              name = "newCategory"
            >
              {listOptions}
            </select>
  }

  render(){

    let display
    if(this.state.createNew){
      display = 
        <div>
          <label>
            Name:
            <input type="text" name="newName" maxLength="30" onChange={this.handleChange}/>
          </label>
          <br/>
          <label>
            Price per kg:
            <input type="number" name="newPrice" onChange={this.handleChange}/>
          </label>
          <label>
            Category:
            {this.renderCategoryOptions()}
          </label>
          <br/>
          <button type="button" className="btn-outline-primary" onClick={this.submitNewTax}>Submit</button>
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
      newValue:null,
      error:false,
    }

    this.editTax=this.editTax.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.isDefaultTax=this.isDefaultTax.bind(this)
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
            newValue: null,
            error:false
          })
          this.props.refreshTaxes()
        })
        .catch(error => {
          console.log(error.message)
          if(error.message==='401'){
            refreshToken({onSuccess:this.fetchUserProfile})
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

  isDefaultTax(){
    for(let i in defaultTaxes){
      if(defaultTaxes[i]['name']===this.props.tax.name){  
        return true
      }
    }
    return false
  }


  render(){
    let tax = this.props.tax

    

    let editDisplay
    if(this.state.edit){

      let deleteButton
      if(!this.isDefaultTax()){
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

export class ProfileDisplay extends React.Component{
  constructor(props){
    super(props)

    this.state={
      profile:{}
    }

    this.fetchUserProfile=this.fetchUserProfile.bind(this)
    this.makeTaxTable=this.makeTaxTable.bind(this)
  }

  fetchUserProfile(){
    fetch('/my-profile/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
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
          profile:json
        })
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchUserProfile})
        }
      });
  }


  makeTaxTable(){
    let taxes = this.props.taxes
    let tableRows=[]
    if(taxes){
      for(let i=0; i<taxes.length; i++){
        tableRows.push(<TaxListItem tax={taxes[i]} refreshTaxes={this.props.refreshTaxes}/>)
      }
    }
    return( 
      <table>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    )
  }

  

  componentDidMount(){
    this.fetchUserProfile()
  }

  render(){
    let user=this.props.user
    let profile=this.state.profile
    let taxTable = this.makeTaxTable()

    return(
      <div>
        <h3>{user.first_name} {user.last_name}</h3>
        <p>Location: {profile.location}</p>
        <p>Date of Birth: {profile.date_of_birth}</p>
        <h4>Taxes</h4>
        {taxTable}
        <CreateTax refreshTaxes={this.props.refreshTaxes}/>
        <button name="hideProfile" className="btn-outline-danger" onClick={this.props.onClick}>Return</button>
      </div>
    )
  }
}