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
      
      if(navigator.geolocation){
        console.log("Geolocation available")
        navigator.geolocation.getCurrentPosition(this.setLocationBias)
      }
    } else {
      console.log("window.google not defined")
    }
  }

  setLocationBias(position){
    var gMaps = window.google.maps

    let geolocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    console.log(geolocation)
    let circle = new gMaps.Circle(
      {center: geolocation, radius: position.coords.accuracy}
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