import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {LoginWrapper} from './loginWrapper.js';
import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';
import {refreshToken}  from './myJWT.js';
import {fetchObject} from './helperFunctions.js';
import {MainView} from './mainView.js';




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
      vehicles: {},
      fuels:{},
      emissions:{},
    }

    this.login=this.login.bind(this)
    this.logout=this.logout.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    
    this.fetchObject = this.fetchObject.bind(this)
    this.refreshFullProfile = this.refreshFullProfile.bind(this)
    this.setFuels = this.setFuels.bind(this)
    this.serverConnectionFailure = this.serverConnectionFailure.bind(this)
    this.setDisplayUnits = this.setDisplayUnits.bind(this)
  }

  componentDidMount(){
    fetchObject({
      url:"/fueltypes/", 
      onSuccess:this.setFuels,
      onFailure:this.serverConnectionFailure,
      noAuth:true,
    })
  }

  serverConnectionFailure(){
    this.setState({serverConnectionFailure:true})
  }

  setFuels(json){
    // fueltypes returns as a paginated view
    this.setState({fuels:json.results})
  }


  fetchObject({url, objectName, onSuccess}){
    /* 
    Function stores the returned data from GET request into this.state.
    Designed to be used to retrieve objects belonging to the user from the database.
    If JWT access has expired, a new token is requested, then the function called again.
    */

    fetch(url, {
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
      this.setState({[objectName]:json})
      if(onSuccess){
        //console.log("onSuccess provided to fetchObject.")
        onSuccess(json)
      }
      //console.log(json)
    })
    .catch(e => {
      console.log(e.message)
      if(e.message==='401'){
        refreshToken({
          onSuccess:this.fetchObject, 
          success_args:[{
            url:url, 
            objectName:objectName, 
            onSuccess:onSuccess
          }]
        })
      }
    });
  }

  login(){
    this.setState({
      loggedIn: true,
    })
  }

  setDisplayUnits(profile){
    console.log(profile)
    this.setState({displayUnits: profile.display_units})
  }

  logout(){
    console.log("Logout successful.")
    this.setState({
      loggedIn:false,
      user:{},
      profile:{},
      taxes:{},
      vehicles:{},
      emissions:{},
      stats:{},
    })
  }

  refreshFullProfile(){
    this.fetchObject({url:"/current-user/", objectName:"user", onSuccess:this.login})
    this.fetchObject({url:"/my-profile/", objectName:"profile", onSuccess:this.setDisplayUnits})
    this.fetchObject({url:"/my-taxes/", objectName:"taxes"})
    this.fetchObject({url:"/my-vehicles/", objectName:"vehicles"})
    this.fetchObject({url:"/my-emissions/", objectName:"emissions"})
    this.fetchObject({url:"/my-stats/", objectName:"stats"})
    fetchObject({
      url:"/fueltypes/", 
      onSuccess:this.setFuels,
      noAuth:true,
    })
  }

  toggleDisplayUnits(){
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }

  
  
  render(){
    

    let serverFailure
    if(this.state.serverConnectionFailure){
      serverFailure = <h4>Error connecting to server.</h4>
    }

    return( 
      <div className="bg-dark">
        <div className="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>  
          {serverFailure}    
          <p>Guilt-driven taxation for the people.</p>
        </div>
        <div>
          <LoginWrapper 
            loggedIn={this.state.loggedIn}
            logout={this.logout} 
            toggleDisplayUnits={this.toggleDisplayUnits} 
            taxes={this.state.taxes}
            user={this.state.user}
            profile={this.state.profile}
            vehicles={this.state.vehicles}
            emissions={this.state.emissions}
            displayUnits={this.state.displayUnits}
            fuels={this.state.fuels}
            stats={this.state.stats}
            refresh={this.refreshFullProfile}
          />
          <MainView
            loggedIn={this.state.loggedIn} 
            displayUnits={this.state.displayUnits} 
            showCalculator={this.showCalculator}
            taxes={this.state.taxes}
            vehicles={this.state.vehicles}
            emissions={this.state.emissions}
            fuels={this.state.fuels}
            profile={this.state.profile}
            refresh={this.refreshFullProfile}
          />
        </div>
        <Sandbox />
        
        <div className="jumbotron">
          <h1>__</h1>
        </div>
     
      </div>
    )
  }
  
}


ReactDOM.render(<App />, document.getElementById('root'))