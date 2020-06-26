import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import * as units from './unitConversions';
import { fetchObject } from './helperFunctions.js';
import { ECONOMY_DECIMALS } from './fuelTypes.js';
import { ObjectSelectionList } from './reactComponents.js';
import {Modal, Button} from 'react-bootstrap';

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
        method:'PATCH',
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

    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    return(
      <tr key={tax.id}>
        <td>{tax.name}</td>
        <td>{sym}{parseFloat(currencyFactor*tax.price_per_kg).toFixed(TAX_RATE_DECIMALS)}/kg CO2</td>
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
        method:'PATCH',
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
  constructor(props){
    super(props)

    this.state = {
      errorMessage:""
    }

    this.handleClick=this.handleClick.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.prepareData=this.prepareData.bind(this)
    this.saveNew=this.saveNew.bind(this)
    this.saveChanges=this.saveChanges.bind(this)
    this.saveSuccess=this.saveSuccess.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.cloneFailure=this.cloneFailure.bind(this)
    this.delete=this.delete.bind(this)
    this.deleteFailure=this.deleteFailure.bind(this)
  }

  handleClick(event){
    let name = event.target.name

    if(name==="cancelEdit"){
      this.props.hideModal()
    } else if(name==="clone" || name==="update"){
      this.prepareData(name)
    } else if(name==="delete"){
      this.delete()
    }
  }

  handleChange(event){
    this.setState({
      [event.target.name]:event.target.value
    })
  }

  prepareData(method){
    this.setState({errorMessage:""})
    let emissionAttributes = ['name', 'date', 'tax_type', 'distance', 'co2_output_kg', 'price']
    let emissionData = {}
    for(let i in emissionAttributes){
      let attribute = emissionAttributes[i]
      if(this.state[attribute]){
        emissionData[attribute]=this.state[attribute]
      } else if(method==="clone"){
        emissionData[attribute]=this.props.emission[attribute]
      }
    }
    if(method==="clone"){
      this.saveNew(emissionData)
    } else if(method==="update"){
      this.saveChanges(emissionData)
    }
  }

  saveNew(data){
    fetchObject({
      url:`/my-emissions/`,
      method:'POST',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.cloneFailure,
    })
  }

  saveChanges(data){
    let key = this.props.emission.id
    fetchObject({
      url:`/emission/${key}/`,
      method:'PATCH',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.updateFailure,
    })
  }

  saveSuccess(){
    console.log("Save success")
    this.props.refresh()
    this.props.hideModal()
  }

  cloneFailure(){
    this.setState({errorMessage:"Unable to clone emission."})
  }

  updateFailure(){
    this.setState({errorMessage:"Unable to save changes."})
  }

  delete(){
    let key = this.props.emission.id
    fetchObject({
      url:`/emission/${key}/`,
      method:'DELETE',
      onSuccess:this.saveSuccess,
      onFailure:this.deleteFailure,
    })
  }

  deleteFailure(){
    this.setState({errorMessage:"Unable to delete emission."})
  }

  render(){
    let emission=this.props.emission
    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Emission</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form>
            <p>{this.state.errorMessage}</p>
            <input type="text" name="name" maxlength="60" placeholder="Trip Name" defaultValue={emission.name} onChange={this.handleChange} />
            <input type="date" name="date" defaultValue={emission.date} onChange={this.handleChange} />
            <br/>
            <label>
              Tax Type:
              <ObjectSelectionList name="tax_type" defaultValue={emission.tax_type} list={this.props.taxes} value="name" label="name" onChange={this.handleChange}/>
            </label>
            <br/>
            <label>
              Distance:
              <input type="number" name="distance" defaultValue={emission.distance} onChange={this.handleChange} />
              {units.distanceString(this.props.displayUnits)}
            </label>
            <br/>
            <label>
              CO2 Output (kg)
              <input type="number" name="co2_output_kg" defaultValue={emission.co2_output_kg} onChange={this.handleChange} />
            </label>
            <br/>
            <label>
              Price: {this.props.profile.currency_symbol}
              <input type="number" name="price" defaultValue={emission.price} onChange={this.handleChange} />
            </label>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <button name="update" className="btn btn-outline-primary" onClick={this.handleClick}>Save changes</button>
          <button name="clone" className="btn btn-outline-success" onClick={this.handleClick}>Save as new</button>
          <button name="cancelEdit" className="btn btn-outline-danger" onClick={this.handleClick}>Cancel edit</button>
          <button name="delete" className="btn btn-outline-dark" onClick={this.handleClick}>Delete</button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export class EmissionDetail extends React.Component{
  constructor(props){
    super(props)

    this.edit=this.edit.bind(this)
  }


  edit(){
    let modal = 
          <EmissionEdit 
            emission={this.props.emission} 
            displayUnits={this.props.displayUnits} 
            profile={this.props.profile} 
            taxes={this.props.taxes} 
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
          />
    this.props.setModal(modal)
  }

  render(){
    let displayUnits=this.props.displayUnits
    let emission=this.props.emission
    let distance=units.distanceDisplay(emission.distance, displayUnits)
    let distString=units.distanceString(displayUnits)
    let sym=this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    let display = 
        <tr key={emission.id}>
          <td><button className="btn btn-outline-primary" onClick={this.edit}><strong>{emission.name}</strong></button></td>
          <td>{emission.date}</td>
          <td>{emission.tax_type}</td>
          <td>{parseFloat(distance).toFixed(1)}{distString}</td>
          <td>{parseFloat(emission.co2_output_kg).toFixed(1)}kg</td>
          <td>{sym}{parseFloat(currencyFactor*emission.price).toFixed(2)}</td>
        </tr>
    

    return display
  }
}