import React from 'react';
import * as getDate from './getDate.js';
import * as units from './unitConversions.js';
import { OptionListInput } from './optionListInput.js';
import { fetchObject, getAttribute, truncate, getObject, displayHrs, encodeEmissionFormat, getHeliEconomy } from './helperFunctions.js';
import { ObjectSelectionList } from './reactComponents.js';
import { MAX_EMISSION_NAME_LEN } from './constants.js';
import { ROAD, AIR, PUBLIC, OTHER } from './constants.js';
import { AIRLINER_KGCO2_PPAX_LT500, AIRLINER_KGCO2_PPAX_GT500, fareClassMultiplier, JET_FUEL_ID } from './constants.js';



export class CarbonCalculator extends React.Component{
  constructor(props){
    super(props)

    // Set default trip name for save
    let tripName
    if(this.props.data.origin){
      let origin = this.props.data.origin
      let destination = this.props.data.destination
      tripName = origin +" to "+destination

      if(this.props.data.returnTrip){
        tripName += " return"
      }

    } else {
      tripName="Default Trip Name"
    }

    // Set emission save format 
    let format
    if(this.props.mode===ROAD){
      format="road"
    }else if(this.props.mode===AIR && this.props.aircraftType==="airliner"){
      format="airDistance"
    } else if(this.props.mode===AIR){
      format="airTime"
    }

    this.state = {
      carbonKg:null,
      date:null,
      tripName:tripName,
      submissionFailed:false,
      relevantTaxes:[],
      tax:null,
      split:1,
      format:format,
    }

    this.calculateCarbon=this.calculateCarbon.bind(this)
    this.saveEmission=this.saveEmission.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.handleSubmitFailure=this.handleSubmitFailure.bind(this)
    this.getRelevantTaxes=this.getRelevantTaxes.bind(this)
    this.calculatePrice=this.calculatePrice.bind(this)
    this.incrementTaxUsage=this.incrementTaxUsage.bind(this)
    this.getTaxRate=this.getTaxRate.bind(this)
  }

  componentDidMount(){
    this.calculateCarbon()
    if(this.props.loggedIn){
      this.getRelevantTaxes()
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.taxes!==prevProps.taxes){
      this.getRelevantTaxes()
    }
  }

  handleChange(event){
    
    if(event.target.name==="split"){
      let value=parseFloat(event.target.value)
      if(!value>0){
        value=1
      }
      this.setState({"split":value}, this.calculateCarbon)
    } else if(event.target.name==="tax"){
      this.setState({tax:parseInt(event.target.value)})
    }else {
      this.setState({
        [event.target.name]:event.target.value
      })
    }
  }

  getRelevantTaxes(){
    let taxCategory = this.props.taxCategory
    let allTaxes = this.props.taxes
    let relevantTaxes = []
    for(let i in allTaxes){
      if(allTaxes[i].category===taxCategory){
        relevantTaxes.push(allTaxes[i])
      }
    }
    this.setState({
      relevantTaxes:relevantTaxes,
      tax:relevantTaxes[0].id,
    })
  }

  calculatePrice(){
    return(this.state.carbonKg*getAttribute(this.state.tax, this.props.taxes, "price_per_kg"))
  }

  getTaxRate(){
    return(getAttribute(this.state.tax, this.props.taxes, "price_per_kg"))
  }

  incrementTaxUsage(){
    let key = this.state.tax
    let usage = getAttribute(key, this.props.taxes, "usage")
    let taxData = {
      usage:(parseInt(usage)+1).toString()
    }
    fetchObject({
      url:`/tax/${key}/`,
      method:'PATCH',
      data:taxData,
      onSuccess:this.props.refresh,
    })
  }

  calculateCarbon(){
    if(this.state.format==="road"){
      let fuelId = this.props.data.fuelId
      let carbonPerL = getAttribute(fuelId, this.props.fuels, "co2_per_unit")
      let carbonKg = (carbonPerL*this.props.data.lPer100km*this.props.data.distanceKm/100)/this.state.split
      this.setState({
        carbonPerL:carbonPerL,
        carbonKg:carbonKg,
      })
    }else if(this.state.format==="airDistance"){
      let carbonPerPaxKmAvg = (this.props.data.distanceKm<500)?AIRLINER_KGCO2_PPAX_LT500:AIRLINER_KGCO2_PPAX_GT500
      let fareClass = fareClassMultiplier[this.props.aircraftFields.airlinerClass]
      let rfMultiplier = this.props.airOptions.multiplier
      this.setState({
        carbonPerPaxKmAvg:carbonPerPaxKmAvg,
        fareClass:fareClass,
        carbonKg:carbonPerPaxKmAvg*this.props.data.distanceKm*fareClass*rfMultiplier,
      })
    }else if(this.state.format==="airTime"){
      let carbonPerHr = getHeliEconomy(this.props.data.aircraftFields.totalSeats)
      let flightHrs = this.props.data.flightHrs
      let numPassengers = this.props.data.aircraftFields.passengers
      this.setState({
        carbonPerHr:carbonPerHr,
        carbonKg:flightHrs*carbonPerHr/numPassengers,
      })
    }
  }

  saveEmission(){
    let date = this.state.date?this.state.date:getDate.today()

    let distance, economy, fuelId, price, offset
    // For air travel, record economy in kg/km or kg/hr.
    if(this.state.format==="road"){
      economy = this.props.data.lPer100km
      distance = this.props.data.distanceKm
      fuelId = this.props.data.fuelId
      price = this.calculatePrice()
      offset = 0
    } else {
      fuelId = this.props.fuels[0].id
      let currencyFactor = this.props.profile.conversion_factor
      offset = this.props.airOptions.offset/currencyFactor
      price = this.calculatePrice() - offset
      
      if(this.state.format==="airDistance"){
        economy = this.state.carbonKg/this.props.data.distanceKm
        distance = this.props.data.distanceKm
      } else if(this.state.format==="airTime"){
        economy = this.state.carbonKg/this.props.data.flightHrs
        distance = this.props.data.flightHrs
      } 
    }

    let emissionData = {
      "name": truncate(this.state.tripName, MAX_EMISSION_NAME_LEN),
      "date": date,
      "distance": parseFloat(distance).toFixed(3),
      "economy": parseFloat(economy).toFixed(2),
      "fuel": `${fuelId}`,
      "split": parseFloat(this.state.split).toFixed(2),
      "co2_output_kg": parseFloat(this.state.carbonKg).toFixed(3),
      "tax_type": `${this.state.tax}`,
      "price": parseFloat(price).toFixed(2),
      "format_encoding": `${encodeEmissionFormat(this.state.format)}`,
      "offset": parseFloat(offset).toFixed(2),
    }

    fetchObject({
      url:'/my-emissions/',
      method:'POST',
      data:emissionData,
      onSuccess:this.props.submitCarbon,
      onFailure:this.handleSubmitFailure,
    })

    this.incrementTaxUsage()
  }

  handleSubmitFailure(){
    this.setState({submissionFailed:"Unable to save emission."})
  }

  render(){
    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    let carbon = parseFloat(this.state.carbonKg).toFixed(2)
    let price = parseFloat(currencyFactor*(this.calculatePrice()))
    let split = parseFloat(this.state.split)
    let taxRate = parseFloat(currencyFactor*this.getTaxRate()).toFixed(2)

    let priceDisplay
    if(this.props.mode===AIR){
      let offset = parseFloat(this.props.airOptions.offset)
      priceDisplay = 
        <div>
          <p> Carbon offset: {sym}{offset}</p>
          <p> ({carbon}kg x {sym}{taxRate}/kg) - Offset = <strong>{sym}{(price-offset).toFixed(2)} carbon tax</strong></p>
        </div>
    } else {
      priceDisplay = <p> {carbon}kg x {sym}{taxRate}/kg = <strong>{sym}{price.toFixed(2)} carbon tax</strong></p>
    }
    

    let failureDisplay
    if(this.state.submissionFailed){
      failureDisplay = <p><strong>{this.state.submissionFailed}</strong></p>
    }
    
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay=
        <div>
          <p> Tax rate:  <ObjectSelectionList name="tax" onChange={this.handleChange} list={this.state.relevantTaxes} label="name" value="id" /></p>
          {priceDisplay}
          <input defaultValue={getDate.today()} type="date" name="date" onChange={this.handleChange}/>
          <input defaultValue={this.state.tripName} type="text" name="tripName" onChange={this.handleChange}/>
          <br/>
          <button
            type="button"
            name="cancel"
            className="btn btn-success m-2"
            onClick={this.saveEmission}
          >Save to profile</button>
          {failureDisplay}
        </div>
    } else {
      memberDisplay = 
        <div>
          <p>Create an account to save emissions and calculate carbon tax.</p>
        </div>
    }

    let distance = parseFloat(units.distanceDisplay(this.props.data.distanceKm, this.props.displayUnits)).toFixed(1)
    let economy = parseFloat(units.convert(this.props.data.lPer100km, this.props.displayUnits)).toFixed(1)

    let calculation
    if(this.state.format==="road"){
      calculation = 
        <div>
          <p> Fuel density: {this.state.carbonPerL}kg CO2/L </p>
          <p> Distance: {distance}{units.distanceString(this.props.displayUnits)} </p>
          <p> Fuel economy: {economy}{units.string(this.props.displayUnits)}</p>
          <p> Split by: <input defaultValue="1" type="number" name="split" onChange={this.handleChange} /></p>       
          <p> Fuel density x (Distance/100) x  Fuel economy / Split = <strong>{carbon}kg CO2</strong></p>
        </div>
    } else if(this.state.format==="airDistance"){
      calculation = 
        <div>
          <p> Airliner - {this.props.aircraftFields.airlinerClass} </p>
          <p> Distance: {distance}{units.distanceString(this.props.displayUnits)} </p>
          <p> Average emissions/seat: {this.state.carbonPerPaxKmAvg}kg CO2/km </p>
          <p> Fare class multiplier: {this.state.fareClass} </p>
          <p> Radiative forcing multiplier: {this.props.airOptions.multiplier} </p>
          <p> Distance * Emissions/seat * Fare class * RF Multiplier = <strong>{carbon}kg CO2</strong></p>
        </div>
    } else if(this.state.format==="airTime"){
      calculation = 
        <div>
          <p> Aircraft - {this.props.aircraftType} </p>
          <p> Flight time: {displayHrs(this.props.data.flightHrs)} </p>
          <p> Emissions per hr: {parseFloat(this.state.carbonPerHr).toFixed(1)}kg CO2</p>
          <p> Passenger loading: {this.props.aircraftFields.passengers}/{this.props.aircraftFields.totalSeats} </p>
          <p> Flight time x Emissions per hour / Passengers = <strong>{carbon}kg CO2</strong></p>
        </div>
    }

    return(
      <div className="container bg-light">
        {calculation}
        {memberDisplay}
      </div>
    )
    
  }
}