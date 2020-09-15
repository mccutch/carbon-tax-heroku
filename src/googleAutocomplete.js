import React from 'react';
import {importGoogleLibraries} from './helperFunctions.js';

export class GoogleAutocomplete extends React.Component{
  constructor(props){
    super(props)


    this.initAutocomplete=this.initAutocomplete.bind(this)
    window.initAutocomplete=this.initAutocomplete

    importGoogleLibraries("initAutocomplete")

    this.setLocationBias=this.setLocationBias.bind(this)
    this.useLocation=this.useLocation.bind(this)
    window.useLocation=this.useLocation
    this.parseGeolocation=this.parseGeolocation.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initAutocomplete()
    }
  }

  initAutocomplete() {
    console.log(`Initialising Google Autocomplete field.`)

    if(window.google){
      var gMaps = window.google.maps

      
      console.log("Initialising Autocomplete inputs.")
      let autoObject = new gMaps.places.Autocomplete(document.getElementById(this.props.id))
      // Make components available to other functions in the class
      this.autoObject = autoObject

      // Set the data fields to return when the user selects a place.
      let returnFields = ['address_components', 'geometry', 'icon', 'name', 'place_id', 'formatted_address']
      autoObject.setFields(returnFields)

      // Take action when autocomplete suggestion is chosen, or raw text input is submitted
      autoObject.addListener('place_changed', function() {window.useLocation()})
      
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
    if(this.props.returnLocation){
      this.props.returnLocation({lat:position.coords.latitude, lng:position.coords.longitude})
    }
  }

  setLocationBias(lat, lng){
    var gMaps = window.google.maps

    let geolocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }
    console.log(geolocation)
    let circle = new gMaps.Circle(
      {center: geolocation, radius: 30}
    )
    this.autoObject.setBounds(circle.getBounds())
  }

  useLocation(){
    console.log("useLocation")
    let place = this.autoObject.getPlace()
    if(!place.geometry){
      this.setState({errorMessage:`Unable to find ${place.name}.`})
      place = null
    }
    this.props.returnPlace(place)
  }

  render(){
    return(
      <input 
        type="text"
        id={this.props.id} 
        name={this.props.name}
        placeholder={this.props.placeholder} 
        className={this.props.className}
        defaultValue={this.props.defaultValue}
        maxLength={this.props.maxLength}
        onChange={(event)=>{this.props.onChange(event); this.props.returnPlace(null)}}
      />
    )
  }
}