import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {EmissionCalculator} from './emissionCalculator.js';
import {LoginWrapper} from './loginWrapper.js';
import {EmissionListWrapper} from './emissionList.js';
//import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';




class App extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      loggedIn: false,
      displayUnits: units.METRIC,
      displayCalculator: true,
      displayEmissions: false,
      user: {},
      profile: {},
      taxes: {},
    }

    this.setLogin=this.setLogin.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.showCalculator=this.showCalculator.bind(this)
    this.showEmissions=this.showEmissions.bind(this)
    this.setTaxes=this.setTaxes.bind(this)
    this.setUser=this.setUser.bind(this)
    this.setProfile=this.setProfile.bind(this)
  }

  setLogin(bool_val){
    this.setState({loggedIn: bool_val})

    if(!bool_val){
      this.setState({
        user:{},
        profile:{},
        taxes:{},
      })
    }
  }

  setTaxes(json){
    this.setState({
      taxes:json,
    })
  }

  setUser(json){
    this.setState({
      user:json,
    })
  }

  setProfile(json){
    this.setState({
      profile:json,
    })
  }

  toggleDisplayUnits(){
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }

  showCalculator(bool_val){
    this.setState({displayCalculator: bool_val})
  }

  showEmissions(bool_val){
    this.setState({displayEmissions: bool_val})
  }

  handleClick(event){
    if(event.target.name==="showCalculator"){
      this.showCalculator(true)
    } else if(event.target.name==="showEmissions"){
      this.showEmissions(true)
    }
  }
  
  
  render(){

    let memberDisplay
    if(this.state.loggedIn){
      memberDisplay = <button className="btn-outline-info" name="showEmissions" onClick={this.handleClick}>View my saved records</button> 
    }

    let display
    if(this.state.displayCalculator){
      display = <EmissionCalculator 
                  loggedIn={this.state.loggedIn} 
                  displayUnits={this.state.displayUnits} 
                  showCalculator={this.showCalculator}
                  taxes={this.state.taxes}
                />
    } else if(this.state.displayEmissions && this.state.loggedIn){
      display = <EmissionListWrapper
                  showEmissions={this.showEmissions}
                  displayUnits={this.state.displayUnits}
                />
    } else {
      display = 
        <div className='container my-2'>
          <button className="btn-outline-info" name="showCalculator" onClick={this.handleClick}>Add a carbon emission</button>
          {memberDisplay}
        </div>
    }

    return( 
      <div className="container-fluid bg-dark">
        <div className="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        <div>
          <LoginWrapper 
            loggedIn={this.state.loggedIn} 
            returnLogin={this.setLogin} 
            toggleDisplayUnits={this.toggleDisplayUnits} 
            taxes={this.state.taxes}
            user={this.state.user}
            profile={this.state.profile}
            returnTaxes={this.setTaxes}
            returnUser={this.setUser}
            returnProfile={this.setProfile}
          />
          {display}
        </div>
        <div className="jumbotron">
          <h1>.</h1>
        </div>
      </div>
    )
  }
  
}


ReactDOM.render(<App />, document.getElementById('root'))