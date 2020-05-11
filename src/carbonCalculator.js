import React from 'react';
import {refreshToken} from './myJWT.js'
import * as getDate from './getDate.js'



export class CarbonCalculator extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      carbonKg:null,
      date:null,
    }

    this.getFuelCarbon=this.getFuelCarbon.bind(this)
    this.saveEmission=this.saveEmission.bind(this)
    this.handleChange=this.handleChange.bind(this)
  }

  handleChange(event){
    if(event.target.name==="date"){
      this.setState({date:event.target.value})
    }
  }

  getFuelCarbon(fuelType){
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
    this.getFuelCarbon(this.props.data.fuelType)
  }

  saveEmission(){

    let tripName = "Unnamed trip"
    let maxLen = 60
    if(this.props.data.origin){
      let origin = this.props.data.origin
      let destination = this.props.data.destination
      origin = origin.substring(0, origin.indexOf(','));
      destination = destination.substring(0, destination.indexOf(','));
      tripName = origin +" to "+destination

      if(tripName.length>=maxLen){
        tripName = tripName.substring(0,maxLen-1)
      }
    }

    let date = getDate.today()
    if(this.state.date){
      date = this.state.date
    }

    let data = {
      "name": tripName,
      "date": date,
      "travel_mode": "Rec driving",
      "distance": this.props.data.distanceKm,
      "co2_output_kg": this.state.carbonKg,
      "price": 1.0 
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
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.saveEmission})
        }
      });
  }


  render(){
    let carbon = this.state.carbonKg
    
    let memberDisplay
    if(this.props.data.loggedIn){
        memberDisplay=
          <div>
            <input defaultValue={getDate.today()} type="date" name="date" onChange={this.handleChange}/>
            <button
              type="button"
              name="cancel"
              class="btn-outline-danger"
              onClick={this.saveEmission}
            >Save to profile</button>
          </div>
      }

    return(
      
      <div className="container bg-info">
        <h1>{parseFloat(carbon).toFixed(2)} kg</h1>
        {memberDisplay}
      </div>
    )
    
  }
}