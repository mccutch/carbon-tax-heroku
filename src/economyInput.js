import React from 'react';
import {VehicleForm} from './vehicleInput.js';
import {refreshToken}  from './myJWT.js';
import * as units from './unitConversions';
import {VehicleSaveForm} from './vehicleSave.js';
import { VehicleTable } from './userTables.js';
import {OptionListInput} from './optionListInput.js';

export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      displayVehicleInput: false,
      displayUserVehicles: false,
      lPer100km: null, // economy must be stored in metric
      fuel: null,
      vehicleWillSave: false,
      saveAs: "My vehicle",
      fuelList: [],
    }
    this.handleClick = this.handleClick.bind(this)
    this.hideForms = this.hideForms.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.submitEconomy = this.submitEconomy.bind(this)
    this.saveVehicle = this.saveVehicle.bind(this)
    this.saveAs = this.saveAs.bind(this)
    this.fetchFuelList = this.fetchFuelList.bind(this)
  }

  componentDidMount(){
    this.fetchFuelList();
  }

  fetchFuelList(){
    let returnList = []
    fetch('/fueltypes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
        for(let i=0; i<json.length; i++){
          returnList.push(json[i].name)
        }
        this.setState({
          fuelList:returnList,
          fuel:returnList[0],
        })
      })
      .catch(e => {
        console.log(e)
      }); 
  }

  handleClick(event){
    if(event.target.name==="displayVehicleForm"){
      this.setState({displayVehicleInput:true})
    } else if(event.target.name==="submitEconomy"){
      this.submitEconomy()
      if(this.state.vehicleWillSave){
        this.saveVehicle()
      }
    } else if(event.target.name==="useSavedVehicle"){
      this.setState({displayUserVehicles:true})
    } else if(event.target.name==="saveVehicle"){
      this.setState({vehicleWillSave:true})
    }
  }

  saveAs(name, econ, fuel){
    console.log("economy.saveas")
    this.setState({
      vehicleWillSave:true,
      saveAs:name,
    })

    if(econ && fuel){
      this.setState({
        fuel: fuel,
        lPer100km: econ,
      })
    }
  }

  saveVehicle(){
    let fuel_id=0
    for(let i=0;i<this.state.fuelList.length; i++){
      if(this.state.fuel===this.state.fuelList[i]){
        fuel_id=i+1;
        break
      }
    }

    let data = {
      "name":this.state.saveAs,
      "fuel":`/fuel/${fuel_id}/`,
      "economy": `${parseFloat(this.state.lPer100km).toFixed(3)}`
    }

    console.log('SAVE AS - DATA:')
    console.log(data)
    
    fetch('/my-vehicles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
      body: JSON.stringify(data)
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
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.saveVehicle})
        }
      });  
  }

  submitEconomy(){

    if(this.state.lPer100km && this.state.fuel){
      this.props.submitEconomy(this.state.lPer100km, this.state.fuel) 
    }
  }

  hideForms(){
    this.setState({displayVehicleInput:false, displayUserVehicles:false, vehicles:null,})
  }

  handleChange(event){
    let value = event.target.value
    if(event.target.name==="economy"){
      this.setState({lPer100km: units.convertFromDisplayUnits(value, this.props.displayUnits)})
    } else if(event.target.name==="fuelType"){
      this.setState({fuel: event.target.value})
    } else if(event.target.name==="vehicleSaveAs"){
      this.setState({saveAs:value})
    }
  }

  render(){
    let saveVehicleDisplay
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay = <button
                        type="button"
                        name="useSavedVehicle"
                        className="btn-outline-success"
                        onClick={this.handleClick}
                      >Use a saved vehicle</button>

      saveVehicleDisplay =  <VehicleSaveForm
                              saveAs={this.saveAs}     
                              vehicleName={this.state.saveAs}
                              vehicleWillSave={this.state.vehicleWillSave}
                            />
    }
    let submitDisplay
    if(this.state.lPer100km && this.state.fuel){
      submitDisplay = 
      <div>
        {saveVehicleDisplay}
        <button
          type="button"
          name="submitEconomy"
          className="btn-outline-primary"
          onClick={this.handleClick}
        >Use these values</button>
      </div>
    }

    let display
    if(this.state.displayVehicleInput){
      display = <VehicleForm 
                submitVehicle={this.props.submitEconomy}
                displayUnits={this.props.displayUnits}
                hideForm={this.hideForms}
                saveVehicle={this.saveVehicle}
                loggedIn={this.props.loggedIn}
                saveAs={this.saveAs}
                vehicleWillSave={this.state.vehicleWillSave}
              />
    } else if(this.state.displayUserVehicles){
      display = 
      <div>
        <VehicleTable 
          vehicles={this.props.vehicles} 
          submitEconomy={this.props.submitEconomy} 
          displayUnits={this.props.displayUnits}
          fuelList={this.state.fuelList}
        />
        <button
          type="button"
          name="cancel"
          className="btn-outline-danger"
          onClick={this.hideForms}
        >Cancel</button>
      </div>
    } else {
      display = <div className="row">
                  <div className="col">
                    <input  
                      type="number"
                      id="economy"
                      onChange={this.handleChange} 
                      name="economy"
                      placeholder="Fuel economy"
                    />
                    <label htmlFor="economy">{units.displayUnitString(this.props.displayUnits)}</label>
                    <OptionListInput name="fuelType" onChange={this.handleChange} list={this.state.fuelList} />
                    {submitDisplay}
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      name="displayVehicleForm"
                      className="btn-outline-success"
                      onClick={this.handleClick}
                    >Find US vehicles</button>
                    {memberDisplay}
                  </div>
                </div>
    }

   
    return(
      <div className='container bg-info py-2'>{display}</div>
    )
  }
}