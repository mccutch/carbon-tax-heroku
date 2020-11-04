import React from 'react';
import './index.css';
//import {keys} from './secret_api_keys.js';
import * as units from './unitConversions.js';
import {Modal} from 'react-bootstrap';

//const GOOGLE_API_KEY = keys.google_api_key;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY


class PlaceInput extends React.Component{

  render(){
    return(
      <input  
        type="text"
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
    this.checkRoute=this.checkRoute.bind(this);
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

  checkRoute(event){
    event.preventDefault()
    if(this.state.origin && this.state.destination){
      this.props.submitQuery(this.state.origin, this.state.destination, this.state.via)
    }
  }

  render(){
    return(
      <form>
        <PlaceInput label="Origin" name="origin" onChange={this.handleChange} />
        <PlaceInput label="Destination" name="destination" onChange={this.handleChange} />
        <PlaceInput label="Via" name="via" onChange={this.handleChange} />
        <button class="btn btn-primary m-2" onClick={this.checkRoute}>Check Route</button>
      </form>
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
        url_suffix = "units=imperial&origin=melbourne&destination=arapiles%20victoria&key="+GOOGLE_API_KEY
      }

    return(
      <div className="py-3">
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

  render(){

    let mapView = <MapView parameters={this.props.parameters}/>

    let display
    if(this.props.routeFound){
      display = mapView
    } else if(this.props.inputError){
      display = <p>{this.props.inputError}</p>
    }
    
    return(
      <div className="container">
        {display}
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
      searchInProgress:false,
      routeFound:false,
      returnTrip:false,
    }

    this.receiveQuery=this.receiveQuery.bind(this)
    this.setReturnTrip=this.setReturnTrip.bind(this)
    this.submitDistance=this.submitDistance.bind(this)
  }

  submitDistance(){
    this.props.submitDistance(this.state.origin, this.state.destination, this.state.distance, this.state.returnTrip)
    this.props.app.hideModal()
  }

  setReturnTrip(){
    if(!this.state.returnTrip){
      this.setState({
        returnTrip:true,
        distance:this.state.distance*2,
      })
    } else if(this.state.returnTrip){
      this.setState({
        returnTrip:false,
        distance:this.state.distance/2,
      })
    }
  }

  receiveQuery(origin, destination, via){
    this.setState({searchInProgress:true})
    let orig_url = encodeURIComponent(origin);
    let dest_url = encodeURIComponent(destination);

    let googleUnits;
    if(this.props.app.displayUnits === units.METRIC){
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
            this.setState({searchInProgress:false})
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

    let returnDisplay
    if(this.state.returnTrip){
      returnDisplay="One way?"
    } else {
      returnDisplay="Return trip?"
    }

    let distance = units.distanceDisplay(this.state.distance, this.props.app.displayUnits)
    let distanceString = parseFloat(distance).toFixed(1)+units.distanceString(this.props.app.displayUnits)

    let submitDisplay
    if(this.state.routeFound){
      submitDisplay=
        <div className="row">
          <button class = "btn btn-outline-warning m-2" onClick={this.setReturnTrip}>{returnDisplay}</button>
          <button class = "btn btn-success m-2" onClick={this.submitDistance}><strong>{distanceString}</strong></button>
        </div>
    }

    let loadingDisplay
    if(this.state.searchInProgress){
      loadingDisplay = <p><strong>Loading results... This sometimes takes a while.</strong></p>
    }

    return(
      <Modal show={true} onHide={this.props.app.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Route Calculator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RouteInputFields submitQuery={this.receiveQuery}/>
          {loadingDisplay}
          <RouteResultView 
            parameters={this.state.directionsSuffix}
            //submitDistance={this.props.submitDistance}
            //origin={this.state.origin}
            //destination={this.state.destination}
            //distance={this.state.distance}
            routeFound={this.state.routeFound}
            inputError={this.state.inputErrorMessage}
            //displayUnits={this.props.app.displayUnits}
            //returnTrip={this.state.returnTrip}
          />
        </Modal.Body>
        <Modal.Footer>
          {submitDisplay}
        </Modal.Footer>
      </Modal>
    );
  }
}