import React from 'react';
import * as getDate from './getDate.js';
import * as units from './unitConversions.js';
import { OptionListInput } from './optionListInput.js';
import { fetchObject, getAttribute } from './helperFunctions.js';
import { ObjectSelectionList } from './reactComponents.js';



export class CarbonCalculator extends React.Component{
  constructor(props){
    super(props)

    // Set default trip name for save
    let tripName
    let maxLen = 60
    if(this.props.data.origin){
      let origin = this.props.data.origin
      let destination = this.props.data.destination
      origin = origin.substring(0, origin.indexOf(','));
      destination = destination.substring(0, destination.indexOf(','));
      tripName = origin +" to "+destination

      if(this.props.data.returnTrip){
        tripName += " return"
      }

      if(tripName.length>=maxLen){
        console.log("Route name too long")
        tripName = tripName.substring(0,maxLen-1)
      } 
    } else {
      tripName="Default Trip Name"
    }

    this.state = {
      carbonKg:null,
      date:null,
      tripName:tripName,
      submissionFailed:false,
      relevantTaxes:[],
      tax:null,
      split:1,
    }

    this.getFuelCarbon=this.getFuelCarbon.bind(this)
    this.saveEmission=this.saveEmission.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.handleSubmitFailure=this.handleSubmitFailure.bind(this)
    this.getRelevantTaxes=this.getRelevantTaxes.bind(this)
    this.calculatePrice=this.calculatePrice.bind(this)
    this.incrementTaxUsage=this.incrementTaxUsage.bind(this)
    this.getTaxRate=this.getTaxRate.bind(this)
  }

  componentDidMount(){
    this.getFuelCarbon()
    if(this.props.loggedIn){
      this.getRelevantTaxes()
    }
  }


  handleChange(event){
    
    if(event.target.name==="split"){
      let value=parseFloat(event.target.value)
      if(!value>0){
        value=1
      }
      this.setState({"split":value}, this.getFuelCarbon)
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

  getFuelCarbon(){
    let fuelId = this.props.data.fuelId
    let fuel = this.props.fuels[parseInt(fuelId)-1]
    let carbonPerL = fuel.co2_per_unit
    let carbonKg = (carbonPerL*this.props.data.lPer100km*this.props.data.distanceKm/100)/this.state.split
    this.setState({
      carbonKg:carbonKg,
      carbonPerL:carbonPerL,
    })
  }

  saveEmission(){
    let date = getDate.today()
    if(this.state.date){
      date = this.state.date
    }

    let emissionData = {
      "name": this.state.tripName,
      "date": date,
      "distance": parseFloat(this.props.data.distanceKm).toFixed(3),
      "economy": this.props.data.lPer100km.toString(),
      //"fuel": `/fuel/${this.props.data.fuelId}/`,
      "fuel": `${this.props.data.fuelId}`,
      "split": parseFloat(this.state.split).toFixed(2),
      "co2_output_kg": parseFloat(this.state.carbonKg).toFixed(3),
      //"tax_type": `/tax/${this.state.tax}/`,
      "tax_type": `${this.state.tax}`,
      "price": parseFloat(this.calculatePrice()).toFixed(2),
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
    let price = parseFloat(currencyFactor*(this.calculatePrice())).toFixed(2)
    let split = parseFloat(this.state.split)
    let taxRate = parseFloat(currencyFactor*this.getTaxRate()).toFixed(2)

    let failureDisplay
    if(this.state.submissionFailed){
      failureDisplay = <p><strong>{this.state.submissionFailed}</strong></p>
    }
    
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay=
        <div>
          <p> Tax rate: {sym}{taxRate}/kg </p>
          <p> {carbon}kg x Tax rate = <strong>{sym}{price} carbon tax</strong></p>
          <input defaultValue={getDate.today()} type="date" name="date" onChange={this.handleChange}/>
          <input defaultValue={this.state.tripName} type="text" name="tripName" onChange={this.handleChange}/>
          <ObjectSelectionList name="tax" onChange={this.handleChange} list={this.state.relevantTaxes} label="name" value="id" />
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

    let distance = (units.distanceDisplay(this.props.data.distanceKm, this.props.displayUnits)).toFixed(1)
    let economy = (units.convert(this.props.data.lPer100km, this.props.displayUnits)).toFixed(1)

    return(
      <div className="container bg-light">
        <p> Fuel density: {this.state.carbonPerL}kg CO2/L </p>
        <p> Distance: {distance}{units.distanceString(this.props.displayUnits)} </p>
        <p> Fuel economy: {economy}{units.string(this.props.displayUnits)}</p>
        <p> Split by: <input defaultValue="1" type="number" name="split" onChange={this.handleChange}/></p>       
        <p> Fuel density x (Distance/100) x  Fuel economy / Split = <strong>{carbon}kg CO2</strong></p>
        {memberDisplay}
      </div>
    )
    
  }
}