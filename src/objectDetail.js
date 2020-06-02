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


export class TaxDetail extends React.Component{
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
          <br/>
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


export class VehicleDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
      fuelList:[],
    }

    this.useVehicle=this.useVehicle.bind(this)
    this.getFuelId=this.getFuelId.bind(this)
    this.getFuelList=this.getFuelList.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.editVehicle=this.editVehicle.bind(this)
    this.cancelEdit=this.cancelEdit.bind(this)
    this.deleteVehicle=this.deleteVehicle.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
  }

  componentDidMount(){
    this.getFuelList()
  }

  getFuelId(fuelName){
    for(let i in this.props.fuels){
      if(this.props.fuels[i].name===fuelName){
        return parseInt(i) + 1
      }
    }
  }

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({lPer100Km: units.convert(event.target.value, this.props.displayUnits)})
    } else if(event.target.name==="name"){
      this.setState({name:event.target.value})
    } else if(event.target.name==="fuel"){
      this.setState({fuelId:this.getFuelId(event.target.value)})
    }
  }

  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.getFuelId(this.props.vehicle.fuel), this.props.vehicle.name)
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
      if(this.state.fuelId){
        vehicleData['fuel']=`/fuel/${parseInt(this.state.fuelId).toString()}/`
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

  getFuelList(){
    let fuelList=[]
    for(let i in this.props.fuels){
      fuelList.push(this.props.fuels[i].name)
    }
    this.setState({
      fuelList:fuelList,
      fuel:fuelList[0],
    })
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
          <OptionListInput name="fuel" onChange={this.handleChange} list={this.state.fuelList} defaultValue={this.props.vehicle.fuel}/>
          <br/>
          <button className="btn btn-outline-primary" name="save" onClick={this.saveChange}>Save</button>
          <button className="btn btn-outline-dark" name="delete" onClick={this.deleteVehicle}>Delete</button>
          <button className="btn btn-outline-danger" name="cancel" onClick={this.cancelEdit}>Cancel</button>
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


class EmissionEdit extends React.Component{

  render(){
    let emission=this.props.emission
    return(
      <td><strong>{emission.name}</strong></td>
    )
  }
}

export class EmissionDetail extends React.Component{
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