import React from 'react';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {CarbonCalculator} from './carbonCalculator.js';
import * as units from './unitConversions';
import * as taxes from './defaultTaxTypes.js';

export class EmissionCalculator extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      lPer100km: 0,
      fuelId: null,
      origin: null,
      destination: null,
      distanceKm: null,
      economySubmitted: false,
      distanceSubmitted: false,
      returnTrip: false,
      activeTab:"distance",
    }
    
    this.handleEdit=this.handleEdit.bind(this)
    this.handleSubmitEconomy=this.handleSubmitEconomy.bind(this)
    this.handleSubmitDistance=this.handleSubmitDistance.bind(this)
    this.exitCalculator=this.exitCalculator.bind(this)
    this.makeTab=this.makeTab.bind(this)
    this.handleTabClick=this.handleTabClick.bind(this)
  }

  exitCalculator(json){
    console.log("saved!")
    console.log(json)
    this.props.exit(json)
  }

  handleSubmitEconomy(lper100km, fuelId){
    this.setState({
      lPer100km: lper100km,
      fuelId: fuelId,
      economySubmitted: true,
      activeTab:"carbon",
    });
  }

  handleSubmitDistance(origin, destination, distanceKm, wasReturnTrip){
    /* Expects to receive distance in km */
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
      returnTrip: wasReturnTrip,
      activeTab:"economy",
    })
  }

  handleEdit(event){
    if(event.target.name==="economy"){
      this.setState({economySubmitted:false})
    } else if(event.target.name==="distance"){
      this.setState({distanceSubmitted:false})
    }
  }

  makeTab(name, label){
    let className
    if(this.state.activeTab === name){
      className="nav-link active"
    } else {
      className="nav-link"
    }
    return <strong><a name={name} className={className} onClick={this.handleTabClick}>{label}</a></strong>
  }

  handleTabClick(event){
    this.setState({activeTab:event.target.name})
  }

  render(){
    let displayUnits=this.props.displayUnits

    let tabDisplay
    
    if(this.state.activeTab==="economy"){
      let economyInput
      if(this.state.economySubmitted){
        let fuelName=this.props.fuels[parseInt(this.state.fuelId)-1].name

        economyInput = 
          <div className="container bg-light" >
            <div className="row">
              <h3>
                {parseFloat(units.convert(this.state.lPer100km, displayUnits)).toFixed(1)} {units.string(displayUnits)}, {fuelName}
              </h3>
              <button
                type="button"
                name="economy"
                className="btn btn-outline-primary m-2"
                onClick={this.handleEdit}
              >Edit</button>
            </div>
          </div>
      } else {
        economyInput = <EconomyInput
                          submitEconomy={this.handleSubmitEconomy}
                          displayUnits={displayUnits}
                          loggedIn={this.props.loggedIn}
                          vehicles={this.props.vehicles}
                          fuels={this.props.fuels}
                          refresh={this.props.refresh}
                        />
      }
      tabDisplay = economyInput
    }
    
    if(this.state.activeTab==="distance"){
      let distanceDisplay
      if(this.state.distanceSubmitted){
        distanceDisplay = 
          <div className="container bg-light" >
            <div className="row">
              <h3>
                {parseFloat(units.distanceDisplay(this.state.distanceKm, displayUnits)).toFixed(0)} {units.distanceString(displayUnits)}
              </h3>
              <button
                type="button"
                name="distance"
                className="btn btn-outline-primary m-2"
                onClick={this.handleEdit}
              >Edit</button>
            </div>
          </div>
      } else {
        distanceDisplay = <DistanceInput  
                            submitDistance={this.handleSubmitDistance}
                            displayUnits={displayUnits}
                            submitted={this.state.distanceSubmitted}
                          />
      }
      tabDisplay = distanceDisplay
    }

    
    if(this.state.activeTab==="carbon"){
      let carbonResult 
      if(this.state.economySubmitted && this.state.distanceSubmitted){
        carbonResult = 
          <div>
            <CarbonCalculator 
              data={this.state} 
              displayUnits={displayUnits} 
              loggedIn={this.props.loggedIn} 
              submitCarbon={this.props.onEmissionSave} 
              taxCategory={taxes.getCategoryName("road-travel")}
              taxes={this.props.taxes}
              fuels={this.props.fuels}
              refresh={this.props.refresh}
              profile={this.props.profile}
            />
          </div>
      } else {
        carbonResult = <p>Complete distance and fuel economy sections to calculate carbon output.</p>
      }
      tabDisplay = carbonResult
    }
    
    return(
      <div className="container bg-light my-2">
        <div className="row mx-2">
          <h3>Carbon Tax Calculator</h3>
          <button type="button" className="btn btn-outline-danger m-2" onClick={this.exitCalculator}>Exit</button>
        </div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            {this.makeTab("distance", "Distance")}
          </li>
          <li className="nav-item">
            {this.makeTab("economy", "Economy")}
          </li>
          <li className="nav-item">
            {this.makeTab("carbon", "Carbon")}
          </li>
        </ul>
        {tabDisplay}
      </div>
    );
  }
}
