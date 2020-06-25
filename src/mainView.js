import React from 'react';
import {EmissionCalculator} from './emissionCalculator.js';
import {EmissionListWrapper} from './emissionList.js';

export class MainView extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      newEmission:null,
      displayCalculator:true,
    }

    this.handleClick=this.handleClick.bind(this)
    this.showCalculator=this.showCalculator.bind(this)
    this.showEmissions=this.showEmissions.bind(this)
    this.hideDisplay=this.hideDisplay.bind(this)
    this.handleEmissionSave=this.handleEmissionSave.bind(this)
  }

  showCalculator(){
    this.setState({displayCalculator: true})
  }

  showEmissions(){
    this.setState({displayEmissions: true})
  }

  hideDisplay(){
    this.setState({
      displayEmissions: false,
      displayCalculator: false,
      newEmission: null,
    })
  }

  handleEmissionSave(json){
    this.hideDisplay()
    this.setState({
      newEmission: json,
    })
  }

  handleClick(event){
    if(event.target.name==="showCalculator"){
      this.showCalculator()
    } else if(event.target.name==="showEmissions"){
      this.showEmissions()
    }
  }


  render(){
    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay = <button className="btn btn-outline-info" name="showEmissions" onClick={this.handleClick}>View my saved records</button> 
    }

    let newEmissionMessage
    if(this.state.newEmission){
      newEmissionMessage = 
        <div className="container bg-success">
          <p><strong>{this.state.newEmission.name}</strong> saved to profile.</p>
        </div>
    }

    let display
    if(this.state.displayCalculator){
      display = <EmissionCalculator 
                  loggedIn={this.props.loggedIn} 
                  displayUnits={this.props.displayUnits} 
                  exit={this.hideDisplay}
                  taxes={this.props.taxes}
                  vehicles={this.props.vehicles}
                  fuels={this.props.fuels}
                  profile={this.props.profile}
                  refresh={this.props.refresh}
                  onEmissionSave={this.handleEmissionSave}
                />
    } else if(this.state.displayEmissions && this.props.loggedIn){
      display = <EmissionListWrapper
                  exit={this.hideDisplay}
                  displayUnits={this.props.displayUnits}
                  emissions={this.props.emissions}
                  taxes={this.props.taxes}
                  profile={this.props.profile}
                  refresh={this.props.refresh}
                />
    } else {
      display = 
        <div className='container bg-light py-2 my-2'>
          {newEmissionMessage}
          <button className="btn btn-outline-info" name="showCalculator" onClick={this.handleClick}>+ Add a carbon emission</button>
          {memberDisplay}
        </div>
    }

    return display
  }
}