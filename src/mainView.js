import React from 'react';
import {EmissionCalculator} from './emissionCalculator.js';
import {EmissionListWrapper} from './emissionList.js';
import {Dashboard} from './dashboard.js';

export class MainView extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      newEmission:null,
    }

    this.selectView=this.selectView.bind(this)
    this.hideDisplay=this.hideDisplay.bind(this)
    this.handleEmissionSave=this.handleEmissionSave.bind(this)
  }


  hideDisplay(){
    this.setState({
      newEmission: null,
    })
    this.props.setView("options")
  }

  handleEmissionSave(json){
    this.hideDisplay()
    this.setState({
      newEmission: json,
    })
  }

  selectView(event){
    this.props.setView(event.target.name)
  }

  render(){


    let memberDisplay
    if(this.props.loggedIn){
      memberDisplay = <button className="btn btn-outline-info" name="dashboard" onClick={this.selectView}>My Dashboard</button> 
    }

    let newEmissionMessage
    if(this.state.newEmission){
      newEmissionMessage = 
        <div className="container bg-success">
          <p><strong>{this.state.newEmission.name}</strong> saved to profile.</p>
        </div>
    }

    let display
    if(this.props.display==="emissionCalculator"){
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
    } else if(this.props.display==="dashboard" && this.props.loggedIn){
      display = <Dashboard stats={this.props.stats}/>
    } else {
      display = 
        <div>
          {newEmissionMessage}
          <button className="btn btn-outline-info" name="emissionCalculator" onClick={this.selectView}>+ Add a carbon emission</button>
          {memberDisplay}
        </div>
    }

    return(
      <div className='container bg-light py-2 my-2'>
        {display}
      </div>
    )
  }
}