import React from 'react';
import { RouteCalculator } from './routeCalculator.js'
import * as units from './unitConversions.js'


export class DistanceInput extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      displayRouteCalculator: false,
      distance: 0,
    }

    this.handleClick = this.handleClick.bind(this)
    this.hideRouteCalculator = this.hideRouteCalculator.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick(event){
    if(event.target.name==="displayRouteCalculator"){
      this.setState({displayRouteCalculator:true})
    } else if(event.target.name==="submitDistance"){

      if(this.state.distance>0){
        this.props.submitDistance("","",units.convertToKm(this.state.distance, this.props.displayUnits), false)
      }
    }
  }


  hideRouteCalculator(){
    this.setState({displayRouteCalculator:false})
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

    let display
    if(this.state.displayRouteCalculator){
      display = <RouteCalculator  
                  submitDistance={this.props.submitDistance}
                  displayUnits={this.props.displayUnits}
                  hideCalculator={this.hideRouteCalculator}
                />
    } else {
      display = <div>
                  <input  
                    type="number"
                    onChange={this.handleChange} 
                    name="distance"
                    placeholder={placeholderText}
                  />
                  <button
                    name="displayRouteCalculator"
                    className=" btn btn-outline-info"
                    onClick={this.handleClick}
                  >Route calculator</button>
                </div>
    }

    let submitDisplay 
    if(this.state.distance){
      submitDisplay = <button name="submitDistance" className=" btn btn-outline-primary" onClick={this.handleClick} >Continue to Vehicle Economy</button>
    }

    return(
      <div className="container bg-light py-2">
        {display}
        {submitDisplay}
      </div>
    )
  }
}