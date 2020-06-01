import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import {refreshToken} from './myJWT.js';
import { VehicleInput } from './vehicleInput.js';
import * as units from './unitConversions';
import { VehicleSaveForm } from './vehicleSave.js';
import { createObject } from './helperFunctions.js';
import {fetchObject} from './helperFunctions.js';
import {ECONOMY_DECIMALS} from './fuelTypes.js';

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
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
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

    createObject({
      url:'/my-taxes/',
      data:taxData,
      onSuccess:this.handlePostSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handlePostSuccess(){
    this.setState({
      createNew:false,
      newName: null,
      newPrice: 0,
      error:false,
    })
    this.props.refresh()
  }

  handlePostFailure(){
    this.setState({error: "Unable to create new tax"})
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
          <button type="button" className="btn btn-outline-primary" onClick={this.handleSubmit}>Submit</button>
          <button className="btn btn-outline-danger" name="cancel" onClick={this.handleClick}>Cancel</button>
        </div>
    } else {
      display = <button className="btn btn-outline-primary" name="create" onClick={this.handleClick}>{this.props.buttonLabel}</button>
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
      newValue:null,
      error:false,
    }

    this.editTax=this.editTax.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.deleteTax=this.deleteTax.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
  }

  deleteTax(){
    let key = parseInt(this.props.tax.id).toString()

    fetchObject({
      url:`/tax/${key}/`,
      method:'DELETE',
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  editTax(event){
    if(event.target.name==="cancel"){
      this.setState({
        edit:false,
        newValue:null,
      })
    } else if(event.target.name==="edit"){
      this.setState({edit:true})
    }
  }

  validateInput(){
    //No validation to apply yet.
    if(this.state.newValue){
      return true
    } else {
      return false
    }
  }


  saveChange(){
    if(this.validateInput()){
      let key = parseInt(this.props.tax.id).toString()

      let taxData = {
        name: this.props.tax.name,
        price_per_kg: parseFloat(this.state.newValue).toFixed(TAX_RATE_DECIMALS),
      }

      fetchObject({
        url:`/tax/${key}/`,
        method:'PUT',
        data:taxData,
        onSuccess:this.editSuccess,
        onFailure:this.editFailure,
      })
    } 
  }

  editSuccess(){
    this.setState({
      edit:false,
      newValue: null,
      error:false
    })
    this.props.refresh()
  }

  editFailure(){
    this.setState({
      error:true
    })
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
        deleteButton = <button className="btn btn-outline-dark" name="delete" onClick={this.deleteTax}>Delete</button>
      }

      let existingValue=parseFloat(this.props.tax.price_per_kg)
      editDisplay = 
        <td>
          <input type="number" defaultValue={existingValue.toFixed(TAX_RATE_DECIMALS)} onChange={this.handleChange} step="0.01"/>
          <button className="btn btn-outline-primary" name="save" onClick={this.saveChange}>Save</button>
          {deleteButton}
          <button className="btn btn-outline-danger" name="cancel" onClick={this.editTax}>Cancel</button>
        </td>
    } else {
      editDisplay = 
        <td>
          <button className="btn btn-outline-warning" name="edit" onClick={this.editTax}>Edit</button>
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
    this.state = {
      edit:false,
    }

    this.useVehicle=this.useVehicle.bind(this)
    this.getFuedId=this.getFuelId.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.editVehicle=this.editVehicle.bind(this)
    this.cancelEdit=this.cancelEdit.bind(this)
    this.deleteVehicle=this.deleteVehicle.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
  }

  getFuelId(){
    for(let i in this.props.fuels){
      if(this.props.fuels[i].name===this.props.vehicle.fuel){
        return i+1
      }
    }
  }

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({lPer100Km: units.convert(event.target.value, this.props.displayUnits)})
    } else {
      this.setState({name:event.target.value})
    }
  }

  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.getFuelId(), this.props.vehicle.name)
  }

  editVehicle(){
    this.setState({edit:true})
  }

  cancelEdit(){
    this.setState({
      edit:false,
      name:null,
      lPer100Km:null,
    })
  }

  deleteVehicle(){
    console.log("DELETE VEHICLE")
  }

  validateInput(){
    //No validation to apply yet.
    if(this.state.name || this.state.lPer100Km){
      return true
    } else {
      return false
    }
  }

  saveChange(){
    if(this.validateInput){
      console.log("SAVE CHANGE")
      let key = parseInt(this.props.vehicle.id).toString()

      let vehicleData ={}
      if(this.state.name){
        vehicleData['name']=this.state.name
      }
      if(this.state.lPer100Km){
        vehicleData['economy']=parseFloat(this.state.lPer100Km).toFixed(ECONOMY_DECIMALS)
      }

      console.log(vehicleData)

      fetchObject({
        url:`/vehicle/${key}/`,
        method:'PUT',
        data:vehicleData,
        onSuccess:this.editSuccess,
        onFailure:this.editFailure,
      })
    }
  }

  editSuccess(){
    this.setState({
      edit:false,
      name:null,
      lPer100Km:null,
      error:false,
    })
    this.props.refresh()
  }

  editFailure(){
    this.setState({
      error:true
    })
  }

  deleteVehicle(){
    let key = parseInt(this.props.vehicle.id).toString()

    fetchObject({
      url:`/vehicle/${key}/`,
      method:'DELETE',
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  deleteSuccess(){
    this.setState({
      edit:false,
      error:false,
    })
    this.props.refresh()
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

    let errorDisplay
    if(this.state.error){
      errorDisplay = <p>Unable to save changes.</p>
    }

    let editDisplay
    if(this.state.edit){

      let existingLPer100Km=units.convert(parseFloat(vehicle.economy), this.props.displayUnits)
      editDisplay = 
        <td>
          {errorDisplay}
          <input name="name" type="text" placeholder="Vehicle name" defaultValue={vehicle.name} onChange={this.handleChange} />
          <label>
            <input name="economy" type="number" placeholder="Economy" defaultValue={existingLPer100Km.toFixed(ECONOMY_DECIMALS)} onChange={this.handleChange} step="0.1"/>
            {units.string(this.props.displayUnits)}
          </label>
          <button className="btn btn-outline-primary" name="save" onClick={this.saveChange}>Save</button>
          <button className="btn btn-outline-danger" name="cancel" onClick={this.cancelEdit}>Cancel</button>
          <button className="btn btn-outline-dark" name="delete" onClick={this.deleteVehicle}>Delete</button>
        </td>
    } else {
      editDisplay = 
        <td>
          <button className="btn btn-outline-warning" name="edit" onClick={this.editVehicle}>Edit</button>
        </td>
    }

    return(
      <tr key={vehicle.id}>
        {vehicleName}
        <td>{economy.toFixed(1)} {units.displayUnitString(this.props.displayUnits)}</td>
        <td>{vehicle.fuel}</td>
        {editDisplay}
      </tr>
    )
  }

}

class CreateVehicle extends React.Component{
  /*
  Render a VehicleInput and VehiceSaveForm.
  Maintain state on vehicle input to render the save form.
  */
  constructor(props){
    super(props)

    this.state={
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    }

    this.receiveInputs=this.receiveInputs.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.cancelNewVehicle=this.cancelNewVehicle.bind(this)
    this.handleSave=this.handleSave.bind(this)
  }

  receiveInputs(lPer100Km, fuelId, name){
    this.setState({
      lPer100Km:lPer100Km,
      fuelId:fuelId,
      name:name,
    })
  }

  cancelNewVehicle(){
    this.setState({
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    })
  }

  handleClick(event){
    if(event.target.name==="createVehicle"){
      this.setState({createNew:true})
    }
  }

  handleSave(){
    this.setState=({
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    })
    this.props.refresh()
  }

  render(){
    let display
    if(!this.state.createNew){
      display = <td><button name="createVehicle" className="btn btn-outline-primary" onClick={this.handleClick}>+ New Vehicle</button></td>
    } else {
      display =
        <td colspan="4">
          <VehicleInput 
            displayUnits={this.props.displayUnits} 
            fuels={this.props.fuels}
            returnEconomy={this.receiveInputs}
          />
          <VehicleSaveForm 
            cancel={this.cancelNewVehicle}
            name={this.state.name}
            lPer100Km={this.state.lPer100Km}
            fuelId={this.state.fuelId}
            onSave={this.handleSave}
          />
        </td>
    }
    return(display)
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
        <VehicleDetail 
          key={vehicles[i].id} 
          vehicle={vehicles[i]} 
          submitEconomy={this.props.submitEconomy} 
          displayUnits={this.props.displayUnits}
          fuels={this.props.fuels}
          refresh={this.props.refresh}
        />
      )
    }
    tableRows.push(<tr><CreateVehicle displayUnits={this.props.displayUnits} fuels={this.props.fuels} refresh={this.props.refresh}/></tr>)
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Name", "Economy", "Fuel", ""]} />
    )
  }
}


class EmissionEdit extends React.Component{

  render(){
    let emission=this.props.emission
    return(
      <td><strong>{emission.name}</strong></td>
    )
  }
}

class EmissionDetail extends React.Component{
  constructor(props){
    super(props)

    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log("Edit table element")
    console.log(event.target.name)
  }

  render(){
    let displayUnits=this.props.displayUnits
    let emission=this.props.emission
    let distance=units.distanceDisplay(emission.distance, displayUnits)
    let distString=units.distanceString(displayUnits)
    return(
      <tr key={emission.id}>
        <EmissionEdit emission={emission} displayUnits={this.displayUnits} />
        <td>{emission.date}</td>
        <td>{emission.travel_mode}</td>
        <td>{parseFloat(distance).toFixed(1)}{distString}</td>
        <td>{parseFloat(emission.co2_output_kg).toFixed(1)}kg</td>
        <td>${parseFloat(emission.price).toFixed(2)}</td>
      </tr>
    )
  }
}

export class EmissionTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let emissions=this.props.emissions
    let tableRows=[]
    for(let i in emissions){
      tableRows.push(
        <EmissionDetail emission={emissions[i]} displayUnits={this.props.displayUnits} />
      )
    }
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Trip Name", "Date", "Travel Mode", "Distance", "CO2 Output", "Tax"]} />
    )
  }
}

