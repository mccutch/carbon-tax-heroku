import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import {refreshToken} from './myJWT.js';
import * as units from './unitConversions';

const MAX_NAME_LEN = 30

/*
Table and accessory components for listing, using and editing objects belonging to a user.


TaxTable
  ObjectTable
    TaxDetail
      CreateTax

VehicleTable
  ObjectTable
    VehicleDetail
      Create Vehicle



*/

class ObjectTable extends React.Component{

  buildHeader(){
    let headers = this.props.headers
    let headerCols = []
    for(let i in headers){
      headerCols.push(<th>{headers[i]}</th>)
    }
    return <tr>{headerCols}</tr>
  }

  render(){
    return(
      <table className="table table-light">
        <thead className="thead-dark">
          {this.buildHeader()}
        </thead>
        <tbody>
          {this.props.tableRows}
        </tbody>
      </table>
    )
  }
}

export class TaxTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let taxes = this.props.taxes
    let tableRows=[]
    if(taxes){
      for(let i=0; i<taxes.length; i++){
        tableRows.push(<TaxDetail key={taxes[i].id} tax={taxes[i]} refresh={this.props.refresh}/>)
      }
    }
    tableRows.push(<tr><CreateTax buttonLabel={"+ New Tax"} refresh={this.props.refresh} existingTaxes={this.props.taxes}/></tr>)
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Name", "Price", "Category", ""]}/>
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
    this.validateNewTax=this.validateNewTax.bind(this)
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

  validateNewTax(){
    //Check name isn't used
    let existingTaxes=this.props.existingTaxes
    for(let i in existingTaxes){
      if(this.state.newName===existingTaxes[i].name && this.state.newCategory===existingTaxes[i].category){
        this.setState({error:"A tax of this name already exists."})
        return false
      }
    }
    return true
  }

  submitNewTax(){

    if(!this.validateNewTax()){
      return
    }

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
        this.props.refresh()
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.submitNewTax})
        }
        this.setState({
          error:"Unable to create new tax."
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
      display = <button className="btn-outline-primary" name="create" onClick={this.handleClick}>{this.props.buttonLabel}</button>
    }

    let errorDisplay
    if(this.state.error){
      errorDisplay=<p>{this.state.error}</p>
    }

    
    return(
      <td>
        {errorDisplay}
        {display}
      </td>
    )

  }
}

class TaxDetail extends React.Component{
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
      //console.log(res)
      if(res.ok){
        this.props.refresh()
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
    //No validation to apply yet.
    return true
  }


  saveChange(){
    if(this.validateInput()){
      let key = parseInt(this.props.tax.id).toString()

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
          this.props.refresh()
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

class VehicleDetail extends React.Component{
  constructor(props){
    super(props)

    this.useVehicle=this.useVehicle.bind(this)
  }

  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.props.vehicle.fuel)
  }

  render(){
    let vehicle=this.props.vehicle
    let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.displayUnits)

    let vehicleName
    if(this.props.submitEconomy){
      vehicleName=<td><button className="btn btn-outline-primary" onClick={this.useVehicle}>{vehicle.name}</button></td>
    } else {
      vehicleName=<td>{vehicle.name}</td>
    }

    return(
      <tr key={vehicle.id}>
        {vehicleName}
        <td>{economy.toFixed(1)} {units.displayUnitString(this.props.displayUnits)}</td>
        <td>{vehicle.fuel}</td>
        <td>
          <button className="btn btn-outline-warning">Edit</button>
        </td>
      </tr>
    )
  }

}


export class VehicleTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let tableRows=[]
    let vehicles=this.props.vehicles
    for(let i=0; i<vehicles.length; i++){
      tableRows.push(
        <VehicleDetail key={vehicles[i].id} vehicle={vehicles[i]} submitEconomy={this.props.submitEconomy} displayUnits={this.props.displayUnits}/>
      )
    }
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Name", "Economy", "Fuel", ""]} />
    )
  }
}

