import React from 'react';
import './index.css';
//import {keys} from './secret_api_keys.js';
import * as units from './unitConversions.js';

//const GOOGLE_API_KEY = keys.google_api_key;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY


class PlaceInput extends React.Component{

  render(){
    console.log(GOOGLE_API_KEY)
    return(
      <input  type="text"
              onChange={this.props.onChange} 
              name={this.props.name}
              placeholder={this.props.label}
      />
    );
  }
}

class RouteInputFields extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      origin: "",
      destination: "",
      via: "",
    }
    this.handleChange=this.handleChange.bind(this);
    this.handleClick=this.handleClick.bind(this);
  }

  handleChange(event){
    let name = event.target.name;
    let value = event.target.value;

    if(name==="origin"){
      this.setState({origin: value});
    } else if(name==="destination"){
      this.setState({destination: value});
    } else if(name==="via"){
      this.setState({via: value});
    }   
  }

  handleClick(){
    if(this.state.origin && this.state.destination){
      this.props.submitQuery(this.state.origin, this.state.destination, this.state.via)
    }
  }

  render(){
    return(
      <div>
        <PlaceInput label="Origin" name="origin" onChange={this.handleChange} />
        <PlaceInput label="Destination" name="destination" onChange={this.handleChange} />
        <PlaceInput label="Via" name="via" onChange={this.handleChange} />
        <button class = "btn btn-outline-secondary" onClick={this.handleClick}>Check Route</button>
      </div>
    );
  }
}

class MapView extends React.Component{

  render(){
    let base_url = "https://www.google.com/maps/embed/v1/directions?";
    let url_suffix
      if(this.props.parameters){
        console.log("New suffix: "+this.props.suffix);
        url_suffix = this.props.parameters;
      } else {
        // Default map display
        url_suffix = "units=imperial&origin=melbourne&destination=arapiles&key="+GOOGLE_API_KEY
      }

    return(
      <div className="pt-3">
        <iframe title="mapDisplay" width="100%" height="100%" frameBorder="0"
                src={base_url+url_suffix}
                allowFullScreen
        >
        </iframe>
      </div>
    );
  }
}

class RouteResultView extends React.Component{
  constructor(props){
    super(props);
    this.handleClick=this.handleClick.bind(this)
    this.setReturnTrip=this.setReturnTrip.bind(this)
  }

  handleClick(){
    if(this.props.origin && this.props.destination && this.props.distance){
      this.props.submitDistance(this.props.origin, this.props.destination, this.props.distance, this.props.returnTrip);
    } else {
      return;
    }
  }

  setReturnTrip(){
    if(this.props.returnTrip){
      this.props.setReturnTrip(false)
    } else {
      this.props.setReturnTrip(true)
    }
  }

  render(){

    let returnDisplay
    if(this.props.returnTrip){
      returnDisplay="One way?"
    } else {
      returnDisplay="Return trip?"
    }

    let submitDisplay
    if(this.props.routeFound){
      let distance = units.distanceDisplay(this.props.distance, this.props.displayUnits)
      submitDisplay=
        <div>
          <h3>Distance: {parseFloat(distance).toFixed(1)}{units.distanceString(this.props.displayUnits)}</h3>
          <button class = "btn btn-outline-warning" onClick={this.setReturnTrip}>{returnDisplay}</button>
          <button class = "btn btn-outline-primary" onClick={this.handleClick}>Use this distance</button>
        </div>
    } else {
      submitDisplay = <p>Loading distance can take ~10s on some days. Submit button will appear here.</p>
    }
    
    return(
      <div className="container">
        <MapView parameters={this.props.parameters}/>
        {submitDisplay}
        <button className="btn btn-outline-danger" onClick={this.props.hideCalculator}>Return to manual entry</button>
      </div>
    );
  }
}


export class RouteCalculator extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      origin: "",
      destination: "",
      via: "",
      distance: 0,
      directionsSuffix: "units=metric&origin=melbourne&destination=arapiles&key="+GOOGLE_API_KEY,
      inputErrorMessage: "",
      routeFound:false,
      returnTrip:false,
    }

    this.receiveQuery=this.receiveQuery.bind(this)
    this.setReturnTrip=this.setReturnTrip.bind(this)
  }

  setReturnTrip(bool_val){
    if(bool_val && !this.state.returnTrip){
      this.setState({
        returnTrip:true,
        distance:this.state.distance*2,
      })
    } else if(!bool_val && this.state.returnTrip){
      this.setState({
        returnTrip:false,
        distance:this.state.distance/2,
      })
    }
  }

  receiveQuery(origin, destination, via){
    let orig_url = encodeURIComponent(origin);
    let dest_url = encodeURIComponent(destination);

    let googleUnits;
    if(this.props.displayUnits === units.METRIC){
      googleUnits = 'metric';
    } else {
      googleUnits = 'imperial';
    }

    let prefix_url = "https://cors-anywhere.herokuapp.com/"
    let base_url = 'https://maps.googleapis.com/maps/api/directions/json?mode=no-cors'
    let suffix = `units=${googleUnits}&origin=${orig_url}&destination=${dest_url}&key=${GOOGLE_API_KEY}`
    if(via){
      suffix += '&waypoints=' + encodeURIComponent(via);
    }
    this.setState({
      directionsSuffix: suffix,
    });
    this.findDistance(prefix_url+base_url+suffix);
  }

  findDistance(url){
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
            console.log(result)
            //Check valid inputs
            switch(result.status){
              case "OK": 
                this.setState({
                  inputErrorMessage: "",
                  routeFound: true,
                })
                break;
              case "NOT_FOUND":
                for(let i=0; i<result.geocoded_waypoints.length; i++){
                  if(result.geocoded_waypoints[i]['geocoder_status']==="ZERO_RESULTS"){
                    console.log(i);
                    let err;
                    if (i===0){
                      err = "your origin."
                    } else if (result.geocoded_waypoints.length===2){
                      err = "your destination."
                    } else if (i===2){
                      err = "your destination."
                    } else {
                      err = "your waypoint."
                    }
                    this.setState({
                      inputErrorMessage: "Google could not find "+err,
                      origin: "",
                      destination: "",
                      via: "",
                      distance: 0,
                      routeFound: false,
                    });
                    break;
                  }
                }
                return;
              case "ZERO_RESULTS":
                this.setState({
                  inputErrorMessage: "No routes found between these locations. Try specifying the region.",
                  routeFound: false,
                });
                return;
              default:
                console.log("Result status: "+result.status);
                return;
            }

            let waypt = false;
            if (result.geocoded_waypoints.length===3){
              waypt=true;
            }
            
            let legs = result.routes[0]['legs'];
            //Find names
            this.setState({origin: legs[0]['start_address']});
            if (waypt){
              this.setState({destination: legs[1]['end_address']});
              this.setState({via: legs[1]['start_address']});
            } else{
              this.setState({destination: legs[0]['end_address']});
            }

            //Find distance
            let dist = 0;
            for (let i=0; i<legs.length; i++){
              console.log(legs[i])
              dist += legs[i]['distance']['value']/1000;
            }
            this.setState({distance: dist});

        },
        (error) => {
            console.log("Error");
        }
      ) 
  }

  render(){


    return(
      <div className="container bg-light" >
        <RouteInputFields submitQuery={this.receiveQuery}/>
        <RouteResultView 
          parameters={this.state.directionsSuffix}
          submitDistance={this.props.submitDistance}
          origin={this.state.origin}
          destination={this.state.destination}
          distance={this.state.distance}
          hideCalculator={this.props.hideCalculator}
          routeFound={this.state.routeFound}
          displayUnits={this.props.displayUnits}
          setReturnTrip={this.setReturnTrip}
          returnTrip={this.state.returnTrip}
        />
      </div>
    );
  }
}