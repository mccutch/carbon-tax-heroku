import React from 'react';
import {VehicleForm} from './vehicleInput.js';
import {refreshToken}  from './myJWT.js';
import * as units from './unitConversions';
import {VehicleSaveForm} from './vehicleSave.js';

class FuelList extends React.Component{
  constructor(props){
    super(props)
    this.state = {list:[]}

    this.renderOptions = this.renderOptions.bind(this)
    this.fetchList = this.fetchList.bind(this)
  }

  renderOptions(){
    let list = this.state.list;
      let listOptions = [];
      for(let i=0; i<list.length; i++){
        listOptions.push(<option 
                            value={list[i]}
                            key = {list[i]}
                          >
                          {list[i]}</option>)
      }
      return listOptions;
  }

  componentDidMount(){
    this.fetchList();
  }

  fetchList(){
    let returnList = [this.props.defaultText]
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
        this.setState({list:returnList})
      })
      .catch(e => {
        console.log(e)
      }); 
  }

  render(){
    return(
      <select
        onChange = {this.props.onChange}
        name = {this.props.label}
      >
        {this.renderOptions()}
      </select>

    )
  }
}

class UserVehicleTable extends React.Component{
  constructor(props){
    super(props)
    this.buildTable=this.buildTable.bind(this)
  }

  buildTable(){
    let tableRows=[]
    for(let i=0; i<this.props.vehicles.length; i++){

      let vehicle=this.props.vehicles[i]
      let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.displayUnits)
      tableRows.push(
        <tr>
          <td>{vehicle.name}</td>
          <td>{economy.toFixed(1)}</td>
          <td>{units.displayUnitString(this.props.displayUnits)}</td>
          <td>{vehicle.fuel}</td>
          <td>
            <button className="btn-outline-warning" name={i.toString()} onClick={this.props.onClick}>Use this vehicle</button>
          </td>
        </tr>
      )
    }

    return( 
      <table>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    )
  }

  render(){
    

    return(
      this.buildTable()
    )

  }
}

export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      displayVehicleInput: false,
      displayUserVehicles: false,
      vehicles: null,
      lPer100km: null, // economy must be stored in metric
      fuel: null,
      vehicleWillSave: false,
      saveAs: "My vehicle"
    }
    this.handleClick = this.handleClick.bind(this)
    this.hideForms = this.hideForms.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.findSavedVehicle = this.findSavedVehicle.bind(this)
    this.handleVehicleChoice = this.handleVehicleChoice.bind(this)
    this.submitEconomy = this.submitEconomy.bind(this)
    this.saveVehicle = this.saveVehicle.bind(this)
    this.saveAs = this.saveAs.bind(this)
  }

  handleClick(event){
    if(event.target.name==="displayVehicleForm"){
      this.setState({displayVehicleInput:true})
    } else if(event.target.name==="submitEconomy"){
      this.submitEconomy()
      if(this.state.vehicleWillSave){
        this.saveVehicle(this.state.saveAs, this.state.lPer100km, this.state.fuel)
      }
    } else if(event.target.name==="useSavedVehicle"){
      this.findSavedVehicle()
    } else if(event.target.name==="saveVehicle"){
      this.setState({vehicleWillSave:true})
    }
  }

  saveAs(name){
    this.setState({
      vehicleWillSave:true,
      saveAs:name
    })
  }

  saveVehicle(name, econ, fuel){
    console.log("SAVE VEHICLE")
    console.log("name: "+name)
    console.log("fuel: "+fuel)
    console.log("econ: "+econ)
    /*
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
          refreshToken({onSuccess:this.saveEmission})
        }
      });
      */
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
      if(value==="FUEL"){value=null}
      this.setState({fuel: value})
    } else if(event.target.name==="vehicleSaveAs"){
      this.setState({saveAs:value})
    }
  }

  findSavedVehicle(){
    fetch('/my-vehicles/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
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
        this.setState({displayUserVehicles: true, vehicles:json})
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.findSavedVehicle})
        }
      });
  }

  handleVehicleChoice(event){
    let id = event.target.name
    console.log(this.state.vehicles[id])
    let chosenVehicle = this.state.vehicles[id]
    this.props.submitEconomy(chosenVehicle.economy, chosenVehicle.fuel)
    this.hideForms()
  }


  render(){
    let saveVehicleDisplay
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay = <button
                        type="button"
                        name="useSavedVehicle"
                        class="btn-outline-success"
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
          class="btn-outline-primary"
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
              />
    } else if(this.state.displayUserVehicles){
      display = 
      <div>
        <UserVehicleTable 
          vehicles={this.state.vehicles} 
          onClick={this.handleVehicleChoice} 
          displayUnits={this.props.displayUnits}
        />
        <button
          type="button"
          name="cancel"
          class="btn-outline-danger"
          onClick={this.hideForms}
        >Cancel</button>
      </div>
    } else {
      display = <div class="row">
                  <div class="col">
                    <input  
                      type="number"
                      id="economy"
                      onChange={this.handleChange} 
                      name="economy"
                      placeholder="Fuel economy"
                    />
                    <label for="economy">{units.displayUnitString(this.props.displayUnits)}</label>
                    <FuelList label="fuelType" onChange={this.handleChange} defaultText="FUEL"/>
                    {submitDisplay}
                  </div>
                  <div class="col">
                    <button
                      type="button"
                      name="displayVehicleForm"
                      class="btn-outline-success"
                      onClick={this.handleClick}
                    >Find US vehicles</button>
                    {memberDisplay}
                  </div>
                </div>
    }

   
    
    return(
      <div class='container bg-info'>{display}</div>
    )
  }
}