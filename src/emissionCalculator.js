import React from 'react';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {CarbonCalculator} from './carbonCalculator.js';
import * as units from './unitConversions';

export class EmissionCalculator extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      lPer100km: 0,
      fuelType: null,
      origin: null,
      destination: null,
      distanceKm: null,
      economySubmitted: false,
      distanceSubmitted: false,
    }
    
    this.handleEdit=this.handleEdit.bind(this)
    this.handleSubmitEconomy=this.handleSubmitEconomy.bind(this)
    this.handleSubmitDistance=this.handleSubmitDistance.bind(this)
    this.exitCalculator=this.exitCalculator.bind(this)
  }

  handleSubmitEconomy(lper100km, fuel){
    this.setState({
      lPer100km: lper100km,
      fuelType: fuel,
      economySubmitted: true,
    });
  }

  handleSubmitDistance(origin, destination, distanceKm){
    /* Expects to receive distance in km */
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
    })
  }

  exitCalculator(){
    this.props.showCalculator(false)
  }

  handleEdit(event){
    if(event.target.name==="economy"){
      this.setState({economySubmitted:false})
    } else if(event.target.name==="distance"){
      this.setState({distanceSubmitted:false})
    }
  }

  render(){
    let displayUnits=this.props.displayUnits


    let economyInput
    if(this.state.economySubmitted){
      economyInput = 
        <div className="container bg-success text-white" >
          <div className="row">
            <h3>
              {parseFloat(units.convert(this.state.lPer100km, displayUnits)).toFixed(1)} {units.string(displayUnits)}, {this.state.fuelType}
            </h3>
            <button
              type="button"
              name="economy"
              className="btn-outline-primary"
              onClick={this.handleEdit}
            >Edit</button>
          </div>
        </div>
    } else {
      economyInput = <EconomyInput
                        submitEconomy={(econ,fuel)=>this.handleSubmitEconomy(econ,fuel)}
                        displayUnits={displayUnits}
                        loggedIn={this.props.loggedIn}
                      />
    }

    let distanceDisplay
    if(this.state.distanceSubmitted){
      distanceDisplay = 
        <div className="container bg-success text-white" >
          <div className="row">
            <h3>
              {parseFloat(units.distanceDisplay(this.state.distanceKm, displayUnits)).toFixed(0)} {units.distanceString(displayUnits)}
            </h3>
            <button
              type="button"
              name="distance"
              className="btn-outline-primary"
              onClick={this.handleEdit}
            >Edit</button>
          </div>
        </div>
    } else {
      distanceDisplay = <DistanceInput  
                          submitDistance={(orig,dest,dist)=>this.handleSubmitDistance(orig,dest,dist)}
                          displayUnits={displayUnits}
                          submitted={this.state.distanceSubmitted}
                        />
    }

    let carbonResult 
    if(this.state.economySubmitted && this.state.distanceSubmitted){
      carbonResult = 
        <div>
          <CarbonCalculator data={this.state} displayUnits={displayUnits} loggedIn={this.props.loggedIn} submitCarbon={this.exitCalculator}/>
        </div>
    }
    
    return(
      <div className="my-2">
        <div className="container bg-info">
          <div className="row">
            <h3>Carbon Tax Calculator</h3>
            <button type="button" className="btn-outline-danger" onClick={this.exitCalculator}>Exit</button>
          </div>
        </div>
        {distanceDisplay}
        {economyInput}
        {carbonResult}
      </div>
    );
  }
}
