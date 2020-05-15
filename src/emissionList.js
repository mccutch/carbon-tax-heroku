import React from 'react';
import{refreshToken} from './myJWT.js';
import * as units from './unitConversions';


class EmissionTable extends React.Component{
  constructor(props){
    super(props)
    this.buildTable=this.buildTable.bind(this)
  }

  buildTable(){
    let emissions=this.props.emissions
    if(emissions.length===0){
      return <p>No saved emissions found.</p>
    }

    let displayUnits=this.props.displayUnits
    let tableRows=[]
    for(let i=0; i<emissions.length; i++){

      let emission=emissions[i]
      let distance=units.distanceDisplay(emission.distance, displayUnits)
      let distString=units.distanceString(displayUnits)
      //let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.displayUnits)
      tableRows.push(
        <tr>
          <td>{emission.name}</td>
          <td>{emission.date}</td>
          <td>{emission.travel_mode}</td>
          <td>{parseFloat(distance).toFixed(1)}{distString}</td>
          <td>{parseFloat(emission.co2_output_kg).toFixed(1)}kg</td>
          <td>${parseFloat(emission.price).toFixed(2)}</td>
          <td>
            <button className="btn-outline-warning" name={i.toString()} onClick={this.props.rubbish}>Edit</button>
          </td>
        </tr>
      )
    }

    return( 
      <table>
        <thead>
          <tr>
            <th>Trip Name</th>
            <th>Date</th>
            <th>Travel Mode</th>
            <th>Distance</th>
            <th>CO2 Output</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    )
  }

  render(){
    return(
      this.buildTable()
    )

  }
}




export class EmissionListWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      displayEmissions: false,
      emissions: null,
    }

    this.exitList=this.exitList.bind(this)
    this.fetchEmissions=this.fetchEmissions.bind(this)
  }

  componentDidMount(){
    this.fetchEmissions()
  }

  exitList(){
    this.props.showEmissions(false)
  }


  fetchEmissions(){
    fetch('/my-emissions/', {
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
        this.setState({displayEmissions: true, emissions:json})
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({onSuccess:this.fetchEmissions})
        }
      });
  }


  render(){
    let emissionTable
    if(this.state.displayEmissions){
      emissionTable = 
        <div>
          <EmissionTable 
            emissions={this.state.emissions} 
            displayUnits={this.props.displayUnits}
          />
        </div>
    }

    return(
      <div className="container bg-info my-2">
        <div className="my-2 row">
          <h3>My saved emissions</h3>
          <button type="button" className="btn-outline-danger" onClick={this.exitList}>Exit</button>
        </div>
        {emissionTable}
      </div>
    )
  }
}