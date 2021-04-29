import React from 'react';
import {VehicleInput, VehicleSearch} from './vehicleInput.js';
import { VehicleTable } from './userTables.js';
import {Modal} from 'react-bootstrap';
import {StandardModal, ObjectSelectionList} from './reactComponents.js';
import {getAttribute, getObject} from './helperFunctions.js';
import {VehicleForm} from './forms.js';
import * as units from './unitConversions.js';


export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    let loggedIn = this.props.app.loggedIn

    this.initialId = loggedIn&&this.props.initialValues ? this.props.initialValues.id : null

    this.state = {
      economy: !loggedIn&&this.props.initialValues ? this.props.initialValues.economy : null,
      fuel: !loggedIn&&this.props.initialValues ? this.props.initialValues.fuel : null,
    }
    this.handleChange=this.handleChange.bind(this)
    this.returnVehicle=this.returnVehicle.bind(this)
    this.inputNewVehicle=this.inputNewVehicle.bind(this)
    this.selectUserVehicle=this.selectUserVehicle.bind(this)
    this.returnError=this.returnError.bind(this)
    this.searchForVehicle=this.searchForVehicle.bind(this)
  }

  componentDidMount(){
    if(this.props.app.loggedIn && this.props.userData.vehicles.length==0){
      this.inputNewVehicle()
    }
  }

  returnError(message){
    this.setState({
      errorMessage:message
    })
  }

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({economy:units.convert(event.target.value, this.props.app.displayUnits)})
    } else {
      this.setState({[event.target.name]: event.target.value})
    }  
  }

  returnVehicle(){
    let vehicle
    
    if(this.props.app.loggedIn){
      vehicle = this.initialId ?
        getObject({objectList:this.props.userData.vehicles, key:"id", keyValue:this.initialId})
        :
        this.props.userData.vehicles[0]

      this.props.returnVehicle(vehicle)
    } else {
      if(!this.state.economy){
        this.returnError("Vehicle economy is required.")
        return
      }

      vehicle = {
        economy:this.state.economy, 
        fuel:this.state.fuel ? this.state.fuel : this.props.app.fuels[0].id, 
        name:this.state.name,
      }

      this.props.returnVehicle(vehicle)
    }
  }

  selectUserVehicle(event){
    console.log(getObject({objectList:this.props.userData.vehicles, key:"id", keyValue:parseInt(event.target.value)}))
    this.props.returnVehicle(
      getObject({objectList:this.props.userData.vehicles, key:"id", keyValue:parseInt(event.target.value)})

    )
  }

  inputNewVehicle(){
    this.props.app.setModal(
      <VehicleInput
        app={this.props.app}
        userData={this.props.userData}
        onSave={(newVehicle)=>{this.props.refresh(); this.props.returnVehicle(newVehicle)}}
      />
    )
  }

  searchForVehicle(){
    this.props.app.setModal(
      <VehicleSearch
        app={this.props.app}
        userData={this.props.userData}
        returnVehicle={this.props.returnVehicle}
      />
    )
  }

  render(){

    return(
      <div className='bg-light py-2'>
        { this.props.app.loggedIn ?
          <div>
            <ObjectSelectionList list={this.props.userData.vehicles} label="name" value="id" onChange={this.selectUserVehicle} defaultValue={this.initialId}/>
            <button className="btn btn-outline-primary" onClick={this.inputNewVehicle} >Input new vehicle</button>
          </div>
          :
          <div>
            <VehicleForm
              app={this.props.app}
              userData={this.props.userData}
              vehicle={this.props.initialValues}
              errorMessage={this.props.errorMessage}
              onChange={this.handleChange}
            />
            or
            <button className="btn btn-outline-info m-2" onClick={this.searchForVehicle} >Search US vehicle database</button> 
          </div>
        }
      
        <div>
          <button className="btn btn-outline-danger m-2" onClick={this.props.prevTab}>Back</button>
          <button className="btn btn-success m-2" disabled={!this.props.app.loggedIn && !this.state.economy} onClick={this.returnVehicle}>Continue to carbon calculator</button>
        </div>
      </div>
    )
  }
}