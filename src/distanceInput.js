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
        this.props.submitDistance("","",units.convertToKm(this.state.distance, this.props.displayUnits))
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
                    id="distance"
                    onChange={this.handleChange} 
                    name="distance"
                    placeholder={placeholderText}
                  />
                  <button
                    type="button"
                    name="submitDistance"
                    className="btn-outline-primary"
                    onClick={this.handleClick}
                  >Submit distance</button>
                  <button
                    type="button"
                    name="displayRouteCalculator"
                    className="btn-outline-success"
                    onClick={this.handleClick}
                  >Route calculator</button>
                </div>
    }


    return(
      <div className="container bg-info py-2">
        {display}
      </div>
    )
  }
}