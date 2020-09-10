import React from 'react';
import {ObjectSelectionList} from './reactComponents.js';
import {airlinerClasses, rfMultiplier, aircraftTypes} from './constants.js';


export class AirOptionsInput extends React.Component{
  constructor(props){
    super(props)

    this.defaultRf = (this.props.aircraftType==="airliner") ? ((this.props.distanceKm<500) ? rfMultiplier.lt500Km : rfMultiplier.gt500Km) : 1
    

    this.state = {
      offset:0,
      multiplier:this.defaultRf,
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
          <input name="offset" type="number" defaultValue={0} className="form-control" onChange={this.handleChange}/>
          <small className="form-text text-muted">Have you already paid to offset this flight?</small>
        </label>
        <br/>
        <label>
          Radiative forcing multiplier: {this.state.multiplier}
          <input name="multiplier" type="range" min="1" max="3" defaultValue={this.defaultRf} onChange={this.handleChange} step="0.1" className="form-control"/>
          <small className="form-text text-muted">
            Emissions and cloud formation (contrails) at cruising altitudes make a significant contribution to the total atmospheric warming effect of 
            air travel. <a href="https://www.carbonbrief.org/explainer-challenge-tackling-aviations-non-co2-emissions" target="_blank">Learn more.</a>
          </small>
        </label>
        <br/>
        <button className="btn btn-success" onClick={this.submit} ><strong>Continue</strong></button>
      </div>
    )
  }
}

export class AircraftInput extends React.Component{
  constructor(props){
    super(props)

    this.state={
      aircraftType:"airliner",
      airlinerClass:"economy",
    }

    this.handleChangeType=this.handleChangeType.bind(this)
    this.handleChangeClass=this.handleChangeClass.bind(this)
    this.handleCharterFieldChange=this.handleCharterFieldChange.bind(this)
    this.submit=this.submit.bind(this)
  }

  handleChangeType(event){
    this.setState({aircraftType:event.target.value})
    if(event.target.value==="airliner"){
      this.setState({airlinerClass:"economy"})
    } else {
      this.setState({
        totalSeats:null,
        passengers:null,
      })
    }
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
          <ObjectSelectionList list={airlinerClasses} value="class" label="label" onChange={this.handleChangeClass} />
        </div>
    } else {
      secondField = 
        <div>
          <input name="totalSeats" type="number" placeholder="Total passenger seats" onChange={this.handleCharterFieldChange} className="form-control"/>
          <input name="passengers" type="number" placeholder="Passengers" onChange={this.handleCharterFieldChange} className="form-control"/>
        </div>
    }

    let submitButton
    if((this.state.aircraftType==="airliner")||(this.state.passengers)){
      submitButton = <button className="btn btn-success" onClick={this.submit}><strong>Continue</strong></button>
    }

    return(
      <div className="container bg-light py-2">
        <ObjectSelectionList list={aircraftTypes} value="type" label="label" onChange={this.handleChangeType} />
        <p>{this.state.errorMessage}</p>
        {secondField}
        {submitButton}
      </div>
    )
  }
}