import React from 'react';
import {EmissionCalculator} from './emissionCalculator.js';
import {EmissionListWrapper} from './emissionList.js';
import {Dashboard} from './dashboard.js';
import {ProfileDisplay} from './userProfile.js';
import {HomeView} from './homeView.js';
import {PaymentView} from './payment.js';
import {ContactPage} from './contact.js';

export class MainView extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      newEmission:null,
    }

    this.selectView=this.selectView.bind(this)
    this.hideDisplay=this.hideDisplay.bind(this)
  }

  hideDisplay(){
    this.props.setView("home")
  }

  selectView(event){
    this.props.setView(event.target.name)
  }

  render(){

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
                  setModal={this.props.setModal}
                  hideModal={this.props.hideModal}
                  selectView={this.selectView}
                />
    } else if(this.props.display==="dashboard"){
      display = <Dashboard 
                  stats={this.props.stats}
                  user={this.props.user}
                  profile={this.props.profile}
                  taxes={this.props.taxes}
                  vehicles={this.props.vehicles}
                  fuels={this.props.fuels}
                  displayUnits={this.props.displayUnits}
                  emissions={this.props.emissions}
                  payments={this.props.payments}
                  recipients={this.props.recipients}
                  refresh={this.props.refresh}
                  logout={this.props.logout}
                  setModal={this.props.setModal}
                  hideModal={this.props.hideModal}
                />
    } else if(this.props.display==="home"){
      display = <HomeView 
                  loggedIn={this.props.loggedIn}
                  selectView={this.selectView}
                  setModal={this.props.setModal}
                />
    } else if(this.props.display==="payment"){
      display = <PaymentView
                  stats={this.props.stats}
                  user={this.props.user}
                  profile={this.props.profile}
                  recipients={this.props.recipients}
                  refresh={this.props.refresh}
                  setModal={this.props.setModal}
                  hideModal={this.props.hideModal}
                  selectView={this.selectView}
                  setView={this.props.setView}
                />
    } else if(this.props.display==="contact"){
      display = <ContactPage 
                  user={this.props.user} 
                  profile={this.props.profile}
                  setModal={this.props.setModal}
                  hideModal={this.props.hideModal}
                  selectView={this.selectView}
                  setView={this.props.setView}
                />
    } else {
      display = 
        <div>
          {newEmissionMessage}
          
        </div>
    }

    return(
      <div >
        {display}
      </div>
    )
  }
}