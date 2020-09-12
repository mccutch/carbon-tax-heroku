import React from 'react';
import {VehicleInput} from './vehicleInput.js';
import {VehicleSaveForm} from './vehicleSave.js';
import { VehicleTable } from './userTables.js';
import {Modal} from 'react-bootstrap';
import {StandardModal} from './reactComponents.js';


export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      lPer100Km: null,
      fuelId: null,
      name: "",
      vehicleWillSave: false,
    }
    this.showUserVehicles=this.showUserVehicles.bind(this)

    this.saveVehicle=this.saveVehicle.bind(this)
    this.cancelSaveVehicle=this.cancelSaveVehicle.bind(this)
    this.handleSave=this.handleSave.bind(this)

    this.receiveEconomy=this.receiveEconomy.bind(this)
    this.submitEconomy=this.submitEconomy.bind(this)
    this.receiveUserVehicle=this.receiveUserVehicle.bind(this)
  }

  showUserVehicles(){
    let vehicleTable = 
      <VehicleTable
        displayUnits={this.props.displayUnits}
        vehicles={this.props.vehicles}
        fuels={this.props.fuels}
        submitEconomy={this.receiveUserVehicle}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
        refresh={this.props.refresh}
      />

    let title = <div>My Vehicles</div>
    let modal = <StandardModal hideModal={this.props.hideModal} title={title} body={vehicleTable} />

    this.props.setModal(modal)
  }

  saveVehicle(){
    this.setState({
      vehicleWillSave:true
    })
  }

  cancelSaveVehicle(){
    this.setState({
      vehicleWillSave:false
    })
  }

  handleSave(){
    this.setState({
      vehicleDidSave:true
    })
  }

  receiveEconomy(lPer100Km, fuelId, name){
    this.setState({
      lPer100Km:lPer100Km,
      fuelId:fuelId,
      name:name,
    })
  }

  receiveUserVehicle(lPer100Km, fuelId, name){
    this.setState({
      lPer100Km:lPer100Km,
      fuelId:fuelId,
      name:name,
    }, this.submitEconomy)
  }

  submitEconomy(){
    this.props.submitEconomy(this.state.lPer100Km, this.state.fuelId)
  }

  render(){

    let vehicleInput=
      <VehicleInput 
        displayUnits={this.props.displayUnits} 
        fuels={this.props.fuels}
        returnEconomy={this.receiveEconomy}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
      />

    let saveDisplay
    let myVehiclesBtn

    if(this.props.loggedIn){

      myVehiclesBtn = <button className="btn btn-outline-info m-2" onClick={this.showUserVehicles}>Use a saved vehicle</button>

      if(this.state.lPer100Km && this.state.fuelId){
        if(this.state.vehicleDidSave){
          saveDisplay = <p>Vehicle saved to profile.</p>
        } else if(this.state.vehicleWillSave){
          saveDisplay = 
            <VehicleSaveForm
              cancel={this.cancelSaveVehicle}
              name={this.state.name}
              lPer100Km={this.state.lPer100Km}
              fuelId={this.state.fuelId}
              onSave={this.handleSave}
            />
        } else {
          saveDisplay = <button className="btn btn-outline-primary m-2" onClick={this.saveVehicle}>Save this vehicle</button>
        }
      }
    }

    return(
      <div className='bg-light py-2'>
        {vehicleInput}
        {myVehiclesBtn}
        {saveDisplay}
        <div>
          <button className="btn btn-outline-danger m-2" onClick={this.props.prevTab}>Back</button>
          <button className="btn btn-success m-2" disabled={!(this.state.lPer100Km && this.state.fuelId)} onClick={this.submitEconomy}>Continue to carbon calculator</button>
        </div>
      </div>
    )
  }
}