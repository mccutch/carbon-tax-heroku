import React from 'react';
import ReactDOM from 'react-dom';
import {VehicleForm} from './vehicleInput.js';
import {RouteCalculator} from './routeCalculator.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {App} from './App.js';

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
      name: null,
      mpg: 0,
      fuelType: null,
      units: METRIC,
      origin: null,
      destination: null,
      distance: null,
    }
    this.convertFromUSMpg = this.convertFromUSMpg.bind(this);
  }

  handleSubmitVehicle(name, mpg, fuel){
    this.setState({ name: name,
                    mpg: mpg,
                    fuelType: fuel,
                  });
  }

  convertFromUSMpg(value){
    /* Convert between US mpg and L/100km */
    /* Return a units as a string if value==null */

    if (this.state.units === METRIC){
      if(!value) {
        return "L/100km";
      } else {
      return 100*3.785411784/(1.609344*value);
      }
    } else if (this.state.units === UK){
      if (!value) {
        return "UK mpg";
      } else{
        return 1.201*value;
      }
    } else if (this.state.units === US){
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
    this.setState({
      origin: origin,
      destination: destination,
      distance: distance,
    })
  }


  render(){

    let vehicleForm = <VehicleForm 
                        submitVehicle={(name,mpg,fuel)=>this.handleSubmitVehicle(name,mpg,fuel)}
                        units={this.state.units}
                        convertFromUSMpg={this.convertFromUSMpg}
                      />

    let routeCalculator = <RouteCalculator  submitDistance={(orig,dest,dist)=>this.handleSubmitDistance(orig,dest,dist)}
                                            units={this.state.units}
                          />

    return(
      <div class="container-fluid bg-dark">
        <div class="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        {routeCalculator}
        <App />
        <div class="jumbotron">
          <h1>Whitespace</h1>
        </div>
      </div>
    );
  }
}



ReactDOM.render(<Page />, document.getElementById('root'))