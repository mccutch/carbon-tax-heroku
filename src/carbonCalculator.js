import React from 'react';
import * as getDate from './getDate.js';
import { OptionListInput } from './optionListInput.js';
import { createObject, fetchObject } from './helperFunctions.js';



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
      tax:{},
    }

    this.getFuelCarbon=this.getFuelCarbon.bind(this)
    this.saveEmission=this.saveEmission.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.handleSubmitFailure=this.handleSubmitFailure.bind(this)
    this.getRelevantTaxes=this.getRelevantTaxes.bind(this)
    this.calculatePrice=this.calculatePrice.bind(this)
    this.incrementTaxUsage=this.incrementTaxUsage.bind(this)
  }


  handleChange(event){
    this.setState({
      [event.target.name]:event.target.value
    })

    if(event.target.name==="tax"){
      this.calculatePrice()
    }
  }

  getRelevantTaxes(){
    let taxCategory = this.props.taxCategory
    let allTaxes = this.props.taxes
    let relevantTaxes = []
    for(let i in allTaxes){
      if(allTaxes[i].category===taxCategory){
        relevantTaxes.push(allTaxes[i].name)
      }
    }
    this.setState({
      relevantTaxes:relevantTaxes,
      tax:relevantTaxes[0],
    })
  }

  calculatePrice(){
    let taxes = this.props.taxes
    for(let i in taxes){
      if(taxes[i].name===this.state.tax){
        console.log(taxes[i].price_per_kg)
        return this.state.carbonKg*taxes[i].price_per_kg
      }
    }
  }

  incrementTaxUsage(){
    let taxes = this.props.taxes
    let usedTax
    for(let i in taxes){
      if(taxes[i].name===this.state.tax){
        usedTax=taxes[i]
        break;
      }
    }
    let taxData = {
      usage:(parseInt(usedTax.usage)+1).toString()
    }

    let key = usedTax.id
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
    let carbonKg = carbonPerL*this.props.data.lPer100km*this.props.data.distanceKm/100
    this.setState({carbonKg:carbonKg})
  }

  componentDidMount(){
    this.getFuelCarbon()
    this.getRelevantTaxes()
  }

  saveEmission(){

    let date = getDate.today()
    if(this.state.date){
      date = this.state.date
    }

    let emissionData = {
      "name": this.state.tripName,
      "date": date,
      "tax_type": this.state.tax,
      "distance": parseFloat(this.props.data.distanceKm).toFixed(3),
      "co2_output_kg": parseFloat(this.state.carbonKg).toFixed(3),
      "price": parseFloat(this.calculatePrice()).toFixed(2)
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
    let carbon = this.state.carbonKg
    let price = this.calculatePrice()

    let failureDisplay
    if(this.state.submissionFailed){
      failureDisplay = <h4>{this.state.submissionFailed}</h4>
    }
    
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay=
        <div>
          <input defaultValue={getDate.today()} type="date" name="date" onChange={this.handleChange}/>
          <input defaultValue={this.state.tripName} type="text" name="tripName" onChange={this.handleChange}/>
          <OptionListInput name="tax" onChange={this.handleChange} list={this.state.relevantTaxes} />
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
      memberDisplay = <h3>Log in to save</h3>
    }

    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    return(
      
      <div className="container bg-light">
        <h1>{parseFloat(carbon).toFixed(2)} kg, {sym}{parseFloat(currencyFactor*price).toFixed(2)}</h1>
        {memberDisplay}
      </div>
    )
    
  }
}