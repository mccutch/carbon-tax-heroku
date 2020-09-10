import React from 'react';
//import { RouteCalculator } from './routeCalculator.js'
import {GoogleDirections} from './googleDirections.js';
import * as units from './unitConversions.js';
import {AIR, ROAD, PUBLIC, OTHER} from './constants.js';


export class DistanceInput extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      distance: 0,
      hours: 0,
      minutes: 0,
    }

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

    let display
    if(this.props.mode===AIR && this.props.aircraftType!=="airliner"){
      display = 
        <div>
          <p>Input flight time for fuel calculation:</p>
          <div className="row">
            <label>
              Hours
              <input name="hours" type="number" onChange={this.handleChange} className="form-control"/>
            </label>
            <br/>
            <label>
              Minutes
              <input name="minutes" type="number" onChange={this.handleChange} className="form-control" />
            </label>
          </div>
        </div>
    } else {
      display = 
        <div>
          <input type="number" onChange={this.handleChange} name="distance" placeholder={placeholderText} className="form-control"/>
          <button name="displayRouteCalculator" className=" btn btn-outline-info m-2" onClick={this.showRouteCalculator} >Route calculator</button>
        </div>
    }

    let submitDisplay 
    if(this.state.distance || this.state.hours || this.state.minutes){
      submitDisplay = <button className=" btn btn-success m-2" onClick={this.submitDistance} >Continue</button>
    }

    return(
      <div className="container bg-light py-2">
        {display}
        {submitDisplay}
      </div>
    )
  }
}