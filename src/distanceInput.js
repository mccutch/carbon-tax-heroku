import React from 'react';
import { RouteCalculator } from './routeCalculator.js'

const US = "mpgUS";
const UK = "mpgUK";
const METRIC = "lPer100Km";

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
    this.convertToKm = this.convertToKm.bind(this)
  }

  handleClick(event){
    if(event.target.name==="displayRouteCalculator"){
      this.setState({displayRouteCalculator:true})
    } else if(event.target.name==="submitDistance"){

      if(this.state.distance>0){
        this.props.submitDistance("","",this.convertToKm(this.state.distance))
      }
    }
  }

  convertToKm(value){
    if(this.props.displayUnits===METRIC){
      return value;
    } else {
      return value/1.60934;
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
    let placeholderText = "Distance"
    if(this.props.displayUnits===METRIC){
      placeholderText+=" (km)"
    } else{
      placeholderText+=" (mi)"
    }

    let display
    if(this.state.displayRouteCalculator){
      display = <RouteCalculator  
                  submitDistance={this.props.submitDistance}
                  units={this.props.displayUnits}
                  hideCalculator={this.hideRouteCalculator}
                />
    } else {
      display = <div>
                  <input  
                    type="text"
                    id="distance"
                    onChange={this.handleChange} 
                    name="distance"
                    placeholder={placeholderText}
                  />
                  <button
                    type="button"
                    name="submitDistance"
                    class="btn-outline-primary"
                    onClick={this.handleClick}
                  >Submit distance</button>
                  <button
                    type="button"
                    name="displayRouteCalculator"
                    class="btn-outline-success"
                    onClick={this.handleClick}
                  >Route calculator</button>
                </div>
    }


    return(
      <div className="container bg-warning">
        {display}
      </div>
    )
  }
}