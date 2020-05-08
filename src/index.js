import React from 'react';
import ReactDOM from 'react-dom';
import {VehicleForm} from './vehicleInput.js';
import {RouteCalculator} from './routeCalculator.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {App} from './App.js';
import {LoginApp} from './LoginApp.js';
import {JWTChecker} from './JWT_checker.js';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {LoginWrapper} from './loginWrapper.js';

const US = "mpgUS";
const UK = "mpgUK";
const METRIC = "lPer100Km";


class APIcaller extends React.Component {
  listVehicles(){
    fetch('/fueltypes')
      .then(res => res.json())
      .then(
        (result) => {
            console.log(result)

        },
        (error) => {
            console.log("Error");
        }
      )
  }


  render(){

    return(
      <div class="container bg-light">
        <p>API Caller</p>
        <button class="btn-outline-danger" onClick={this.listVehicles}>List Vehicles</button>
      </div>
    );
  }
}

class Page extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lPer100km: 0,
      fuelType: null,
      displayUnits: METRIC,
      origin: null,
      destination: null,
      distance: null,
      loggedIn: false,
    }
    this.convertFromUSMpg = this.convertFromUSMpg.bind(this);
    this.toggleDisplayUnits = this.toggleDisplayUnits.bind(this);
    this.setLogin = this.setLogin.bind(this);
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

  

  convertFromDisplayUnits(value){
    if (this.state.displayUnits === METRIC){
      return value;
    } else if (this.state.displayUnits === UK){
      return 100*3.785411784*1.201/(1.609344*value)
    } else if (this.state.displayUnits === US){
      return 100*3.785411784/(1.609344*value)
    } else {
      console.log("Unknown economy units.")
      return 0;
    }
  }

  handleSubmitEconomy(economy, fuel){
    this.setState({
      lPer100km: this.convertFromDisplayUnits(economy),
      fuelType: fuel,
    });
  }

  convertFromUSMpg(value){
    /* Convert from US mpg to display units */
    /* Return a units as a string if value==null */

    if (this.state.displayUnits === METRIC){
      if(!value) {
        return "L/100km";
      } else {
      return 100*3.785411784/(1.609344*value);
      }
    } else if (this.state.displayUnits === UK){
      if (!value) {
        return "UK mpg";
      } else{
        return 1.201*value;
      }
    } else if (this.state.displayUnits === US){
      if (!value) {
        return "US mpg";
      } else {
        return value;
      }
    } else {
      console.log("Unknown economy units.")
      return 0;
    }
  }

  handleSubmitDistance(origin, destination, distance){
    /* Expects to receive distance in km */
    this.setState({
      origin: origin,
      destination: destination,
      distance: distance,
    })
  }

  setLogin(bool_val){
    this.setState({loggedIn: bool_val})
  }


  render(){


    let economyInput = <EconomyInput
                        submitEconomy={(econ,fuel)=>this.handleSubmitEconomy(econ,fuel)}
                        units={this.state.displayUnits}
                        convertFromUSMpg={this.convertFromUSMpg}
                      />

    let routeCalculator = <RouteCalculator  submitDistance={(orig,dest,dist)=>this.handleSubmitDistance(orig,dest,dist)}
                                            units={this.state.displayUnits}
                          />

    let distanceInput = <DistanceInput  
                          submitDistance={(orig,dest,dist)=>this.handleSubmitDistance(orig,dest,dist)}
                          displayUnits={this.state.displayUnits}
                        />


    let loginWrapper =  <div className="container bg-info">
                          <LoginWrapper loggedIn={this.state.loggedIn} login={this.setLogin}/>
                          <button type="button" class = "btn-outline-warning" onClick={this.toggleDisplayUnits}>Change Units</button>
                        </div>


    return(
      <div class="container-fluid bg-dark">
        <div class="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        <div>
          <JWTChecker />
          <div>{loginWrapper}</div>
          <div>{distanceInput}</div>
          <div>{economyInput}</div>
        </div>
        <div class="jumbotron">
          <h1>Whitespace</h1>
        </div>
      </div>
    );
  }
}



ReactDOM.render(<Page />, document.getElementById('root'))