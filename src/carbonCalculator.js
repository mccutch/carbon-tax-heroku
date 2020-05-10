import React from 'react';
import {refreshToken} from './myJWT.js'

export class CarbonCalculator extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      carbonKg:null,
    }

    this.getFuelCarbon=this.getFuelCarbon.bind(this)
    this.saveEmission=this.saveEmission.bind(this)
  }

  getFuelCarbon(fuelType){
    let returnList = [this.props.defaultText]
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
    console.log(this.state)
    console.log(this.props.data)

    fetch('/my-vehicles/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
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
        this.setState({displayUserVehicles: true, vehicles:json})
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.findSavedVehicle})
        }
      });
  }


  render(){
    let carbon = this.state.carbonKg
    
    let memberDisplay
    if(this.props.data.loggedIn){
        memberDisplay=
          <div>
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