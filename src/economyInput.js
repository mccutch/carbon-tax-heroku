import React from 'react';
import {VehicleForm} from './vehicleInput.js';

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
        onChange = {this.props.onChange}////not used yet - use to change parent state
        name = {this.props.label} ////not used
      >
        {this.renderOptions()}
      </select>

    )
  }
}

export class EconomyInput extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      displayVehicleInput: false,
      economy: null,
      fuel: null,
    }
    this.handleClick = this.handleClick.bind(this)
    this.hideVehicleForm = this.hideVehicleForm.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick(event){
    if(event.target.name==="displayVehicleForm"){
      this.setState({displayVehicleInput:true})
    } else if(event.target.name==="submitEconomy"){
      if(this.state.economy && this.state.fuel){
        this.props.submitEconomy(this.state.economy, this.state.fuel) 
      }
    }
  }

  hideVehicleForm(){
    this.setState({displayVehicleInput:false})
  }

  handleChange(event){
    let value = event.target.value
    if(event.target.name==="economy"){
      this.setState({economy: value})
    } else if(event.target.name==="fuelType"){
      if(value==="FUEL"){value=null}
      this.setState({fuel: value})
    }
  }


  render(){
    let display
    if(this.state.displayVehicleInput){
      display = <VehicleForm 
                submitVehicle={this.props.submitEconomy}
                units={this.props.displayUnits}
                convertFromUSMpg={this.props.convertFromUSMpg}
                hideForm={this.hideVehicleForm}
              />
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
                    <label for="economy">{this.props.convertFromUSMpg()}</label>
                    <FuelList label="fuelType" onChange={this.handleChange} defaultText="FUEL"/>
                    <button
                      type="button"
                      name="submitEconomy"
                      class="btn-outline-primary"
                      onClick={this.handleClick}
                    >Use these values</button>
                  </div>
                  <div class="col">
                    <button
                      type="button"
                      name="displayVehicleForm"
                      class="btn-outline-success"
                      onClick={this.handleClick}
                    >Find US vehicles</button>
                  </div>
                </div>
    }
    
    return(
      <div class='container bg-info'>{display}</div>
    )
  }
}