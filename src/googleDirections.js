import React from 'react';
import {StandardModal} from './reactComponents.js';
import {DEFAULT_MAP_CENTER} from './constants.js';
import * as units from './unitConversions.js';
import {ROAD, AIR, OTHER, PUBLIC} from './constants.js'; //carbon input modes
import {importGoogleLibraries} from './helperFunctions.js';

//const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY


export class GoogleDirections extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      returnTrip: false,
    }


    this.initMap=this.initMap.bind(this)  
    window.initMap=this.initMap  

    /*if(!window.google){
      console.log("Generating Google API script.")
      var script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry&callback=initMap`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }*/

    importGoogleLibraries("initMap")

    this.useInput=this.useInput.bind(this)
    window.useInput=this.useInput

    this.setLocationBias=this.setLocationBias.bind(this)
    this.findDirections=this.findDirections.bind(this)
    this.useRoute=this.useRoute.bind(this)
    this.updateDistance=this.updateDistance.bind(this)
    this.submitDistance=this.submitDistance.bind(this)
    this.handleErrorStatus=this.handleErrorStatus.bind(this)
    this.chooseTravelMode=this.chooseTravelMode.bind(this)
    this.findFlightPath=this.findFlightPath.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initMap()
    }
  }

  initMap() {
    console.log(`Initialising Google Maps with mode=${this.props.mode}.`)

    if(window.google){
      var gMaps = window.google.maps

      console.log("Initialising map...")
      let map = new gMaps.Map(document.getElementById("map"), {
          center: DEFAULT_MAP_CENTER,
          zoom: 8,
          controlSize: 20,
          draggable: true,
          mapTypeControl: false,
          streetViewControl: false,
        });
      this.map = map

      if(this.props.mode===ROAD){
        console.log("Initialising DirectionsService and DirectionsRenderer...")
        let directionsService = new gMaps.DirectionsService()
        let directionsRenderer = new gMaps.DirectionsRenderer({map:map})
        // Make components available to other functions in the class
        this.directionsService = directionsService
        this.directionsRenderer = directionsRenderer
      }else if(this.props.mode===AIR){
        console.log("Initialising Polyline object...")
        let polyLine = new gMaps.Polyline({
          //path: flightPlan,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2 
        });
        this.polyLine = polyLine
      }
      
      console.log("Initialising Autocomplete inputs.")
      let autoOrigin = new gMaps.places.Autocomplete(document.getElementById("origin"))
      let autoDestination = new gMaps.places.Autocomplete(document.getElementById("destination"))
      let autoVia = new gMaps.places.Autocomplete(document.getElementById("via"))
      // Make components available to other functions in the class
      this.originAutocomp = autoOrigin
      this.destinationAutocomp = autoDestination
      this.viaAutocomp = autoVia

      // Set the data fields to return when the user selects a place.
      let returnFields = ['address_components', 'geometry', 'icon', 'name', 'place_id']
      autoOrigin.setFields(returnFields)
      autoDestination.setFields(returnFields)
      autoVia.setFields(returnFields)

      // Take action when autocomplete suggestion is chosen, or raw text input is submitted
      autoOrigin.addListener('place_changed', function() {window.useInput("origin")})
      autoDestination.addListener('place_changed', function() {window.useInput("destination")})
      autoVia.addListener('place_changed', function() {window.useInput("via")})
      
      if(this.props.locationBias){
        this.setLocationBias(this.props.locationBias.lat, this.props.locationBias.lng)
      } else {
        if(navigator.geolocation){
          console.log("Geolocation available")
          navigator.geolocation.getCurrentPosition(this.parseGeolocation)
        }
      }
    } else {
      console.log("window.google not defined")
    }
  }

  parseGeolocation(position){
    this.setLocationBias(position.coords.latitude, position.coords.longitude)
    console.log(`Position accuracy: ${position.coords.accuracy}`)
  }

  setLocationBias(lat, lng){
    // Set map center and autocomplete biasing based on user location
    var gMaps = window.google.maps

    let geolocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }
    console.log(geolocation)
    let circle = new gMaps.Circle(
      {center: geolocation, radius:30}
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
    this.setState({[inputType]:place}, this.chooseTravelMode)
  }

  chooseTravelMode(){
    if(this.props.mode===AIR){
      this.findFlightPath()
    } else {
      this.findDirections()
    }
  }

  findFlightPath(){
    let gMaps = window.google.maps

    if(this.state.origin && this.state.destination){
      console.log(`Finding flight path from ${this.state.origin.name} to ${this.state.destination.name}...`)
      if(this.state.via){console.log(`...via ${this.state.via.name}.`)}

      //Encode lat-long coordinates
      let flightPlanLocations = []
      let flightPlanCoords = []
      flightPlanLocations.push(this.state.origin.geometry.location)
      if(this.state.via){flightPlanLocations.push(this.state.via.geometry.location)}
      flightPlanLocations.push(this.state.destination.geometry.location)

      //Render polyline on map
      let bounds = new gMaps.LatLngBounds()
      for(let i in flightPlanLocations){
        bounds.extend(flightPlanLocations[i])
        flightPlanCoords.push(flightPlanLocations[i].toJSON())
      }
      this.map.fitBounds(bounds)
      this.polyLine.setPath(flightPlanCoords)
      this.polyLine.setMap(this.map);

      //Calculate flight distance
      let distance = gMaps.geometry.spherical.computeLength(flightPlanLocations)/1000
      this.setState({distance:distance}, this.updateDistance)
    }
  }

  findDirections(){
    let gMaps = window.google.maps

    if(this.state.origin && this.state.destination){
      console.log("Finding route...")

      let waypoints = []
      if(this.state.via){
        waypoints.push({location:this.state.via.geometry.location.toJSON()})
      }
      
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
            this.useRoute(response.routes[0].legs)
          } else {
            this.handleErrorStatus(status)
          }
        }
      );
    }
  }

  handleErrorStatus(status){
    let errorMessage
    if(status==="ZERO_RESULTS"){
      errorMessage = "No routes found between these locations. Try specifying the region."
    } else {
      errorMessage = `Failed due to ${status}.`
    }
    this.setState({errorMessage:errorMessage})
  }

  useRoute(legs){
    console.log(legs)
    let distance = 0
    for(let i in legs){
      distance += legs[i].distance.value/1000
    }
    this.setState({distance:distance}, this.updateDistance)
  }

  updateDistance(){
    this.setState({totalDistance:this.state.distance*(this.state.returnTrip ? 2 : 1)})
  }

  submitDistance(){
    this.props.submitDistance(this.state.origin.name, this.state.destination.name, this.state.totalDistance, this.state.returnTrip)
    this.props.hideModal()
  }

  render(){
    let errorMessage
    if(this.state.errorMessage){errorMessage = <p><strong>{this.state.errorMessage}</strong></p>}

    let title = <div>Route Calculator</div>

    let body = 
      <div>
        <input type="text" id="origin" placeholder="Origin" className="form-control"/>
        <input type="text" id="destination" placeholder="Destination" className="form-control"/>
        <input type="text" id="via" placeholder="Via" className="form-control"/>
        {errorMessage}
        <div id="map" style={{height:"300px", width:"100"}}></div>
      </div>

    let footer 
    if(this.state.totalDistance){
      let distDisplay = units.distanceDisplay(this.state.totalDistance, this.props.displayUnits)
      let unitDisplay = units.distanceString(this.props.displayUnits)
      let returnButton
      if(!this.state.returnTrip){
        returnButton = <button className="btn btn-warning m-2" onClick={()=>this.setState({returnTrip:true}, this.updateDistance)}>Return trip?</button>
      } else {
        returnButton = <button className="btn btn-warning m-2" onClick={()=>this.setState({returnTrip:false}, this.updateDistance)}>One way?</button>
      }
      footer = 
        <div>
          {returnButton}
          <button className="btn btn-success m-2" onClick={this.submitDistance}><strong>{parseFloat(distDisplay).toFixed(1)}{unitDisplay}</strong></button>
        </div>
    }

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer}/>
  }
}