import React from 'react';
//import { RouteCalculator } from './routeCalculator.js'
import {GoogleDirections} from './googleDirections.js';
import * as units from './unitConversions.js'


export class DistanceInput extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      distance: 0,
    }

    this.handleClick = this.handleClick.bind(this)
    this.showRouteCalculator = this.showRouteCalculator.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick(event){
    if(event.target.name==="submitDistance"){
      if(this.state.distance>0){
        this.props.submitDistance("","",units.convertToKm(this.state.distance, this.props.displayUnits), false)
      }
    }
  }

  showRouteCalculator(){
    /*let modal = <RouteCalculator  
                  submitDistance={this.props.submitDistance}
                  displayUnits={this.props.displayUnits}
                  hideModal={this.props.hideModal}
                />*/
    let modal = <GoogleDirections submitDistance={this.props.submitDistance} hideModal={this.props.hideModal} displayUnits={this.props.displayUnits}/>
    this.props.setModal(modal)
  }

  handleChange(event){
    if(event.target.name==="distance"){
      if(event.target.value>=0){
        this.setState({distance:event.target.value})
      }
    }
  }


  render(){
    let placeholderText = `Distance (${units.distanceString(this.props.displayUnits)})`

    let submitDisplay 
    if(this.state.distance){
      submitDisplay = <button name="submitDistance" className=" btn btn-success m-2" onClick={this.handleClick} >Continue to Vehicle Economy</button>
    }

    return(
      <div className="container bg-light py-2">
        <input  
          type="number"
          onChange={this.handleChange} 
          name="distance"
          placeholder={placeholderText}
        />
        <button
          name="displayRouteCalculator"
          className=" btn btn-outline-info m-2"
          onClick={this.showRouteCalculator}
        >Route calculator</button>
        {submitDisplay}
      </div>
    )
  }
}