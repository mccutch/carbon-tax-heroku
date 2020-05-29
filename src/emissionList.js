import React from 'react';
import{refreshToken} from './myJWT.js';
import * as units from './unitConversions';
import { EmissionTable } from './userTables.js';



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