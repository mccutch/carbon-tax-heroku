import React from 'react';
import ReactDOM from 'react-dom';
import {VehicleForm} from './vehicleInput.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {App} from './App.js';
import {LoginApp} from './LoginApp.js';
import {JWTChecker} from './JWT_checker.js';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {LoginWrapper} from './loginWrapper.js';
import {CarbonCalculator} from './carbonCalculator.js'
import * as units from './unitConversions';


const US = "mpgUS";
const UK = "mpgUK";
const METRIC = "lPer100Km";


class Page extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lPer100km: 0,
      fuelType: null,
      displayUnits: METRIC,
      origin: null,
      destination: null,
      distanceKm: null,
      loggedIn: false,
      economySubmitted: false,
      distanceSubmitted: false,
    }
    this.toggleDisplayUnits = this.toggleDisplayUnits.bind(this);
    this.setLogin = this.setLogin.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  toggleDisplayUnits(){
    if(this.state.displayUnits===METRIC){
      this.setState({displayUnits:US})
    } else if(this.state.displayUnits===US){
      this.setState({displayUnits:UK})
    } else if(this.state.displayUnits===UK){
      this.setState({displayUnits:METRIC})
    }
  }


  

  handleSubmitEconomy(lper100km, fuel){
    this.setState({
      lPer100km: lper100km,
      fuelType: fuel,
      economySubmitted: true,
    });
  }

  

  handleSubmitDistance(origin, destination, distanceKm){
    /* Expects to receive distance in km */
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
    })
  }

  setLogin(bool_val){
    this.setState({loggedIn: bool_val})
  }

  handleEdit(event){
    if(event.target.name==="economy"){
      this.setState({economySubmitted:false})
    } else if(event.target.name==="distance"){
      this.setState({distanceSubmitted:false})
    }
  }

  render(){


    let economyInput
    if(this.state.economySubmitted){
      economyInput = 
        <div className="container bg-success text-white" >
          <div className="row">
            <h3>
              {parseFloat(units.convert(this.state.lPer100km, this.state.displayUnits)).toFixed(1)} {units.string(this.state.displayUnits)}, {this.state.fuelType}
            </h3>
            <button
              type="button"
              name="economy"
              class="btn-outline-primary"
              onClick={this.handleEdit}
            >Edit</button>
          </div>
        </div>
    } else {
      economyInput = <EconomyInput
                        submitEconomy={(econ,fuel)=>this.handleSubmitEconomy(econ,fuel)}
                        displayUnits={this.state.displayUnits}
                        loggedIn={this.state.loggedIn}
                      />
    }

    let distanceDisplay
    if(this.state.distanceSubmitted){
      distanceDisplay = 
        <div className="container bg-success text-white" >
          <div className="row">
            <h3>
              {parseFloat(units.distanceDisplay(this.state.distanceKm, this.state.displayUnits)).toFixed(0)} {units.distanceString(this.state.displayUnits)}
            </h3>
            <button
              type="button"
              name="distance"
              class="btn-outline-primary"
              onClick={this.handleEdit}
            >Edit</button>
          </div>
        </div>
    } else {
      distanceDisplay = <DistanceInput  
                          submitDistance={(orig,dest,dist)=>this.handleSubmitDistance(orig,dest,dist)}
                          displayUnits={this.state.displayUnits}
                          submitted={this.state.distanceSubmitted}
                        />
    }

    


    let loginWrapper =  <div className="container bg-info">
                          <LoginWrapper loggedIn={this.state.loggedIn} login={this.setLogin}/>
                          <button type="button" class = "btn-outline-warning" onClick={this.toggleDisplayUnits}>Change Units</button>
                        </div>

    let carbonResult 
    if(this.state.economySubmitted && this.state.distanceSubmitted){
      carbonResult = 
        <div>
          <CarbonCalculator data={this.state}/>
        </div>
    }
    


    return(
      <div class="container-fluid bg-dark">
        <div class="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        <div>
          <JWTChecker />
          <div>{loginWrapper}</div>
          <div>{distanceDisplay}</div>
          <div>{economyInput}</div>
          <div>{carbonResult}</div>
        </div>
        <div class="jumbotron">
          <h1>Whitespace</h1>
        </div>
      </div>
    );
  }
}



ReactDOM.render(<Page />, document.getElementById('root'))