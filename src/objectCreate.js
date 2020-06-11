import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import {refreshToken} from './myJWT.js';
import { VehicleInput } from './vehicleInput.js';
import * as units from './unitConversions';
import { VehicleSaveForm } from './vehicleSave.js';
import { createObject } from './helperFunctions.js';
import {fetchObject} from './helperFunctions.js';
import { ECONOMY_DECIMALS } from './fuelTypes.js';
import { MAX_NAME_LEN } from './validation.js';

export class CreateTax extends React.Component{
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


export class CreateVehicle extends React.Component{
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