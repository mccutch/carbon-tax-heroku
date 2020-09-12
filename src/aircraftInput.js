import React from 'react';
import {ObjectSelectionList} from './reactComponents.js';
import {airlinerClasses, rfMultiplier, aircraftTypes} from './constants.js';
import {getAttribute} from './helperFunctions.js';


export class AirOptionsInput extends React.Component{
  constructor(props){
    super(props)

    this.defaultRf = (this.props.aircraftType==="airliner") ? ((this.props.distanceKm<500) ? rfMultiplier.lt500Km : rfMultiplier.gt500Km) : 1
    let init = this.props.initialValues

    this.state = {
      offset:init.offset ? init.offset : 0,
      multiplier:init.multiplier ? init.multiplier : this.defaultRf,
    }

    this.handleChange=this.handleChange.bind(this)
    this.submit=this.submit.bind(this)
  }

  handleChange(event){
    let value = parseFloat(event.target.value)
    this.setState({[event.target.name]:value})
  }

  submit(){
    this.props.returnOptions({
      offset:this.state.offset,
      multiplier:this.state.multiplier,
    })
  }

  render(){
    return(
      <div className="container bg-light py-2">
        <label>
          Carbon offset($)
          <input name="offset" type="number" className="form-control" onChange={this.handleChange} defaultValue={this.state.offset}/>
          <small className="form-text text-muted">Have you already paid to offset this flight?</small>
        </label>
        <br/>
        <label>
          Radiative forcing multiplier: {this.state.multiplier}
          <input name="multiplier" type="range" min="1" max="3" onChange={this.handleChange} step="0.1" className="form-control" defaultValue={this.state.multiplier}/>
          <small className="form-text text-muted">
            Emissions and cloud formation (contrails) at cruising altitudes make a significant contribution to the total atmospheric warming effect of 
            air travel. <a href="https://www.carbonbrief.org/explainer-challenge-tackling-aviations-non-co2-emissions" target="_blank">Learn more.</a>
          </small>
        </label>
        <br/>
        <button className="btn btn-outline-danger m-2" onClick={this.props.prevTab}>Back</button>
        <button className="btn btn-success" onClick={this.submit} ><strong>Continue</strong></button>
      </div>
    )
  }
}

export class AircraftInput extends React.Component{
  constructor(props){
    super(props)

    let init = this.props.initialValues

    this.state={
      aircraftType:init.aircraftType ? init.aircraftType : aircraftTypes[0].type,
      airlinerClass:init.airlinerClass ? init.airlinerClass : airlinerClasses[0].class,
      totalSeats:init.totalSeats ? init.totalSeats : null,
      passengers:init.passengers ? init.passengers : null,
    }

    this.handleChangeType=this.handleChangeType.bind(this)
    this.handleChangeClass=this.handleChangeClass.bind(this)
    this.handleCharterFieldChange=this.handleCharterFieldChange.bind(this)
    this.submit=this.submit.bind(this)
  }

  handleChangeType(event){
    this.setState({aircraftType:event.target.value})
  }

  handleChangeClass(event){
    this.setState({airlinerClass:event.target.value})
  }

  handleCharterFieldChange(event){
    this.setState({[event.target.name]:parseFloat(event.target.value)})
  }

  submit(){
    let returnData
    if(this.state.aircraftType==="airliner"){
      returnData = {airlinerClass:this.state.airlinerClass}
    } else {
      let totalSeats = this.state.totalSeats?this.state.totalSeats:this.state.passengers
      if(this.state.passengers>totalSeats){
        this.setState({
          errorMessage:"There aren't enough seats for those passengers..."
        })
        return
      }
      returnData = {
        totalSeats:totalSeats,
        passengers:this.state.passengers,
      }
    }
    this.props.returnAircraft(this.state.aircraftType, returnData)
  }

  render(){
    let secondField
    if(this.state.aircraftType==="airliner"){
      secondField = 
        <div>
          <ObjectSelectionList list={airlinerClasses} value="class" label="label" onChange={this.handleChangeClass} defaultValue={this.state.airlinerClass}/>
          <small>Seat spacing changes the relative emissions per passenger between fare classes. <a href="http://documents1.worldbank.org/curated/en/141851468168853188/pdf/WPS6471.pdf">Learn more.</a></small>
        </div>
    } else {
      secondField = 
        <div>
          <label>
            Passengers:
            <input name="passengers" type="number" placeholder="Passengers" onChange={this.handleCharterFieldChange} className="form-control my-2" defaultValue={this.state.passengers}/>
            <small>Emissions produced will be shared between passengers.</small>
          </label>
          <br/>
          <label>
            Passenger seats:
            <input name="totalSeats" type="number" placeholder="Seats" onChange={this.handleCharterFieldChange} className="form-control my-2" defaultValue={this.state.totalSeats}/>
            <small>Used for estimating fuel consumption based on aircraft size.</small>
          </label>
        </div>
    }

    let submitButton
    if((this.state.aircraftType==="airliner")||(this.state.passengers)){
      submitButton = <button className="btn btn-success m-2" onClick={this.submit}><strong>Continue</strong></button>
    }

    return(
      <div className="container bg-light py-2">
        <ObjectSelectionList list={aircraftTypes} value="type" label="label" onChange={this.handleChangeType} defaultValue={this.state.aircraftType}/>
        <p>{this.state.errorMessage}</p>
        {secondField}
        {submitButton}
      </div>
    )
  }
}