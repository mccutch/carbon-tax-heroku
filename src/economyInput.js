import React from 'react';
import {VehicleInput} from './vehicleInput.js';
import {VehicleSaveForm} from './vehicleSave.js';
import { VehicleTable } from './userTables.js';
import {Modal} from 'react-bootstrap';
import {StandardModal, ObjectSelectionList} from './reactComponents.js';
import {getAttribute, getObject} from './helperFunctions.js';
import {VehicleForm} from './forms.js';
import * as units from './unitConversions.js';


export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    this.initialId = this.props.loggedIn&&this.props.initialValues ? this.props.initialValues.id : null

    this.state = {
    }
    this.handleChange=this.handleChange.bind(this)
    this.returnVehicle=this.returnVehicle.bind(this)
    this.inputNewVehicle=this.inputNewVehicle.bind(this)
    this.selectUserVehicle=this.selectUserVehicle.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message
    })
  }

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({economy:units.convert(event.target.value, this.props.displayUnits)})
    } else {
      this.setState({[event.target.name]: event.target.value})
    }  
  }

  returnVehicle(){
    let vehicle
    
    if(this.props.loggedIn){
      vehicle = this.initialId ?
        getObject({objectList:this.props.vehicles, key:"id", keyValue:this.initialId})
        :
        this.props.vehicles[0]

      this.props.returnVehicle(vehicle)
    } else {
      if(!this.state.lPer100Km){
        this.returnError("Vehicle economy is required.")
        return
      }

      vehicle = {
        economy:this.state.lPer100Km, 
        fuel:this.state.fuel ? this.state.fuel : this.props.fuels[0].id, 
        name:this.state.name,
      }

      this.props.returnVehicle(vehicle)
    }
  }

  selectUserVehicle(event){
    console.log(getObject({objectList:this.props.vehicles, key:"id", keyValue:parseInt(event.target.value)}))
    this.props.returnVehicle(
      getObject({objectList:this.props.vehicles, key:"id", keyValue:parseInt(event.target.value)})

    )
  }

  inputNewVehicle(){
    this.props.setModal(
      <VehicleInput
        displayUnits={this.props.displayUnits}
        fuels={this.props.fuels}
        onSave={(newVehicle)=>{this.props.refresh(); this.props.returnVehicle(newVehicle)}}
        refresh={this.props.refresh}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
      />
    )
  }

  render(){

    return(
      <div className='bg-light py-2'>
        { this.props.loggedIn ?
            <div>
              <ObjectSelectionList list={this.props.vehicles} label="name" value="id" onChange={this.selectUserVehicle} defaultValue={this.initialId}/>
              <button className="btn btn-outline-primary" onClick={this.inputNewVehicle} >Input new vehicle</button>
            </div>
            :
            <VehicleForm
              loggedIn={this.props.loggedIn}
              vehicle={this.props.initialValues}
              fuels={this.props.fuels}
              displayUnits={this.props.displayUnits}
              errorMessage={this.props.errorMessage}
              onChange={this.handleChange}
            />
        }
      
        <div>
          <button className="btn btn-outline-danger m-2" onClick={this.props.prevTab}>Back</button>
          <button className="btn btn-success m-2" disabled={!this.props.loggedIn && !(this.state.lPer100Km && this.state.fuel)} onClick={this.returnVehicle}>Continue to carbon calculator</button>
        </div>
      </div>
    )
  }
}