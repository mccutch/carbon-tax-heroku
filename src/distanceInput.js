import React from 'react';
//import { RouteCalculator } from './routeCalculator.js'
import {GoogleDirections} from './googleDirections.js';
import * as units from './unitConversions.js';
import {AIR, ROAD, PUBLIC, OTHER} from './constants.js';


export class DistanceInput extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      distance: !this.props.inputHrs ? this.props.initialValue : 0,
      hours: this.props.inputHrs ? Math.floor(this.props.initialValue) : 0,
      minutes: this.props.inputHrs ? Math.round((this.props.initialValue%1)*60) : 0,
    }

    this.hasInitial = this.props.initialValue!==0 ? true:false

    this.submitDistance = this.submitDistance.bind(this)
    this.showRouteCalculator = this.showRouteCalculator.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  submitDistance(event){
    if(this.state.distance>0){
      this.props.submitDistance("","",units.convertToKm(this.state.distance, this.props.displayUnits), false)
    }else if(this.state.hours>0 || this.state.minutes>0){
      this.props.submitFlightHrs(this.state.hours+this.state.minutes/60)
    }
  }

  showRouteCalculator(){
    let modal = <GoogleDirections submitDistance={this.props.submitDistance} hideModal={this.props.hideModal} displayUnits={this.props.displayUnits} mode={this.props.mode}/>
    this.props.setModal(modal)
  }

  handleChange(event){
    if(event.target.value>=0){
      this.setState({[event.target.name]:parseFloat(event.target.value)})
    }
  }

  render(){
    let placeholderText = `Distance (${units.distanceString(this.props.displayUnits)})`

    //let display
    //if(this.props.mode===AIR && this.props.aircraftType!=="airliner"){
    let display = this.props.inputHrs ?
      <div>
        <p>Input flight time for fuel calculation:</p>
        <div className="row">
          <label>
            Hours
            <input name="hours" type="number" onChange={this.handleChange} className="form-control" defaultValue={this.hasInitial? Math.floor(this.props.initialValue):null}/>
          </label>
          <br/>
          <label>
            Minutes
            <input name="minutes" type="number" onChange={this.handleChange} className="form-control" defaultValue={this.hasInitial?Math.round((this.props.initialValue%1)*60):null}/>
          </label>
        </div>
      </div>
      :
      <div>
        <label>
          {placeholderText}
          <input type="number" onChange={this.handleChange} name="distance" placeholder={placeholderText} className="form-control" defaultValue={this.hasInitial?units.distanceDisplay(this.props.initialValue, this.props.displayUnits):null}/>
        </label>
        <button name="displayRouteCalculator" className=" btn btn-outline-info m-2" onClick={this.showRouteCalculator} >Route calculator</button>
      </div>

    return(
      <div className="container bg-light py-2">
        {display}
        {this.props.mode===AIR ? <button className="btn btn-outline-danger m-2" onClick={this.props.prevTab}>Back</button> : ""}
        <button className=" btn btn-success m-2" disabled={!(this.state.distance || this.state.hours || this.state.minutes)} onClick={this.submitDistance} >Continue</button>
      </div>
    )
  }
}