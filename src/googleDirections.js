import React from 'react';

import {StandardModal} from './reactComponents.js';
import {DEFAULT_MAP_CENTER} from './constants.js';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY


export class GoogleDirections extends React.Component{
  constructor(props){
    super(props)

    this.state = {}


    this.initMap=this.initMap.bind(this)  
    window.initMap=this.initMap  

    var script = document.createElement('script');
    console.log("generating script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initMap`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);

    this.useInput=this.useInput.bind(this)
    window.useInput=this.useInput
    this.setLocationBias=this.setLocationBias.bind(this)
    this.findDirections=this.findDirections.bind(this)
  }

  initMap() {
    console.log("Initialise Map, Autocomplete, Directions services")

    if(window.google){
      var gMaps = window.google.maps

      let map = new gMaps.Map(document.getElementById("map"), {
          center: DEFAULT_MAP_CENTER,
          zoom: 8,
          controlSize: 20,
          draggable: true,
          mapTypeControl: false,
          streetViewControl: false,
        });

      let directionsService = new gMaps.DirectionsService()
      let directionsRenderer = new gMaps.DirectionsRenderer({map:map, suppressMarkers:false,})

      let autoOrigin = new gMaps.places.Autocomplete(document.getElementById("origin"))
      let autoDestination = new gMaps.places.Autocomplete(document.getElementById("destination"))
      let autoVia = new gMaps.places.Autocomplete(document.getElementById("via"))

      // Set the data fields to return when the user selects a place.
      let returnFields = ['address_components', 'geometry', 'icon', 'name', 'place_id']
      autoOrigin.setFields(returnFields)
      autoDestination.setFields(returnFields)
      autoVia.setFields(returnFields)

      // Take action when autocomplete suggestion is chosen, or raw text input is submitted
      autoOrigin.addListener('place_changed', function() {window.useInput("origin")})
      autoDestination.addListener('place_changed', function() {window.useInput("destination")})
      autoVia.addListener('place_changed', function() {window.useInput("via")})

      // Make components available to other functions in the class
      this.originAutocomp = autoOrigin
      this.destinationAutocomp = autoDestination
      this.viaAutocomp = autoVia
      this.directionsService = directionsService
      this.directionsRenderer = directionsRenderer
      this.map = map
      
      if(navigator.geolocation){
        console.log("Geolocation available")
        navigator.geolocation.getCurrentPosition(this.setLocationBias)
      }

    } else {
      console.log("window.google not defined")
    }
  }

  setLocationBias(position){
    // Set map center and autocomplete biasing based on user location
    var gMaps = window.google.maps

    let geolocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    console.log(geolocation)
    let circle = new gMaps.Circle(
      {center: geolocation, radius: position.coords.accuracy}
    )
    this.originAutocomp.setBounds(circle.getBounds())
    this.destinationAutocomp.setBounds(circle.getBounds())
    this.viaAutocomp.setBounds(circle.getBounds())
    this.map.setCenter(geolocation)  
  }

  useInput(inputType){
    this.setState({errorMessage:""})
    let place
    if(inputType==="origin"){place = this.originAutocomp.getPlace()}
    if(inputType==="destination"){place = this.destinationAutocomp.getPlace()}
    if(inputType==="via"){place = this.viaAutocomp.getPlace()}

    console.log(`${inputType}: ${place.name}`)
    if(!place.geometry){
      this.setState({errorMessage:`Unable to find ${place.name}.`})
      place = null
    }
    this.setState({[inputType]:place}, this.findDirections)
  }

  findDirections(){
    let gMaps = window.google.maps

    if(this.state.origin && this.state.destination){
      console.log("Finding route...")

      let waypoints = []
      if(this.state.via){
        waypoints.push({location:this.state.via.geometry.location.toJSON()})
      }

      console.log(waypoints)
      
      this.directionsService.route(
        {
          origin: this.state.origin.geometry.location.toJSON(),
          destination: this.state.destination.geometry.location.toJSON(),
          waypoints: waypoints,
          travelMode: gMaps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            this.directionsRenderer.setDirections(response);
            console.log(response)
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
    }
  }

  render(){
    let errorMessage
    if(this.state.errorMessage){errorMessage = <p><strong>{this.state.errorMessage}</strong></p>}

    let title = <div>GoogleDirections</div>

    let body = 
      <div>
        <input type="text" id="origin" placeholder="Origin" className="form-control"/>
        <input type="text" id="destination" placeholder="Destination" className="form-control"/>
        <input type="text" id="via" placeholder="Via" className="form-control"/>
        {errorMessage}
        <div id="map" style={{height:"500px", width:"100"}}></div>
      </div>

    let footer = <div>Footer</div>

    return (
      <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer}/>
      )
  }
}