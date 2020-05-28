import React from 'react';
import {refreshToken} from './myJWT.js';
import * as getDate from './getDate.js';
import { OptionListInput } from './optionListInput.js';



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
    this.handleSubmitSuccess=this.handleSubmitSuccess.bind(this)
    this.handleSubmitFailure=this.handleSubmitFailure.bind(this)
    this.getRelevantTaxes=this.getRelevantTaxes.bind(this)
    this.calculatePrice=this.calculatePrice.bind(this)
  }


  handleChange(event){
    /*
    if(event.target.name==="date"){
      this.setState({date:event.target.value})
    } else if (event.target.name==="tripName"){
      this.setState({tripName:event.target.value})
    }
    */

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

  getFuelCarbon(){
    let fuelType = this.props.data.fuelType

    fetch('/fueltypes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        throw new Error(res.status)
      }
    })
    .then(json => {

      for(let i=0; i<json.length; i++){
        if(fuelType===json[i].name){
          let carbonPerL = json[i].co2_per_unit
          let carbonKg = carbonPerL*this.props.data.lPer100km*this.props.data.distanceKm/100
          this.setState({carbonKg:carbonKg})
        }
      }
    })
    .catch(e => {
      console.log(e)
    });
  }

  componentDidMount(){
    this.getFuelCarbon()
    this.getRelevantTaxes()
    
  }

  saveEmission(){
    let tripName = this.state.tripName

    let date = getDate.today()
    if(this.state.date){
      date = this.state.date
    }

    let data = {
      "name": tripName,
      "date": date,
      "travel_mode": this.state.tax,
      "distance": parseFloat(this.props.data.distanceKm).toFixed(3),
      "co2_output_kg": parseFloat(this.state.carbonKg).toFixed(3),
      "price": parseFloat(this.calculatePrice()).toFixed(2)
    }

    fetch('/my-emissions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
      body: JSON.stringify(data)
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
        console.log(json)
        this.handleSubmitSuccess(json)
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.saveEmission})
        }
        this.handleSubmitFailure()
      });
  }

  handleSubmitSuccess(){
    this.props.submitCarbon()
  }

  handleSubmitFailure(){
    this.setState({submissionFailed:true})
  }

  render(){
    let carbon = this.state.carbonKg
    let price = this.calculatePrice()

    let failureDisplay
    if(this.state.submissionFailed){
      failureDisplay = <h3>Submission failed, sorry.</h3>
    }
    
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay=
        <div>
          <input defaultValue={getDate.today()} type="date" name="date" onChange={this.handleChange}/>
          <input defaultValue={this.state.tripName} type="text" name="tripName" onChange={this.handleChange}/>
          <OptionListInput name="tax" onChange={this.handleChange} list={this.state.relevantTaxes} />
          <button
            type="button"
            name="cancel"
            className="btn-outline-danger"
            onClick={this.saveEmission}
          >Save to profile</button>
          {failureDisplay}
        </div>
    } else {
      memberDisplay = <h3>Log in to save</h3>
    }

    return(
      
      <div className="container bg-info">
        <h1>{parseFloat(carbon).toFixed(2)} kg, ${parseFloat(price).toFixed(2)}</h1>
        {memberDisplay}
      </div>
    )
    
  }
}