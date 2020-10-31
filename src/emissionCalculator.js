import React from 'react';
import {Modal, Navbar} from 'react-bootstrap';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {AircraftInput, AirOptionsInput} from './aircraftInput.js';
import {CarbonCalculator} from './carbonCalculator.js';
import * as units from './unitConversions';
import * as taxes from './defaultTaxTypes.js';
import {EmissionEdit} from './objectEdit.js';
import {ObjectSelectionList, StandardModal} from './reactComponents.js';
import {TabbedNavBar} from './navBar.js';
import {getAttribute, displayHrs} from './helperFunctions.js';
import {aircraftTypes, airlinerClasses} from './constants.js';
import * as urls from './urls.js';
import {Redirect} from 'react-router-dom';

//Carbon emission modes
import {ROAD, AIR, PUBLIC, OTHER} from './constants.js';

const emissionModes = [
      {mode:ROAD, label:"Road"},
      {mode:AIR, label:"Air Travel"},
      //{mode:PUBLIC, label:"Public Transport"},
      //{mode:OTHER, label:"Miscellaneous"},
    ]

const roadTabs = [
        {name:"distance", label:"Distance"}, 
        {name:"economy", label:"Economy"}, 
        {name:"carbon", label:"Carbon"}
      ]
const airTabs = [
        {name:"aircraft", label:"Aircraft"},
        {name:"distance", label:"Distance"}, 
        {name:"airOptions", label:"Options"}, 
        {name:"carbon", label:"Carbon"},
      ]

export class EmissionCalculator extends React.Component{
  constructor(props){
    super(props);
    this.defaultState = {
      lPer100Km: 0,
      fuelId: null,
      origin: null,
      destination: null,
      distanceKm: 0,
      flightHrs: 0,
      aircraftType: null,
      aircraftFields: {},
      airOptions: {},
      economySubmitted: false,
      distanceSubmitted: false,
      aircraftSubmitted: false,
      airOptionsSubmitted: false,
      returnTrip: false,
    }

    this.state=this.defaultState
    this.state['mode']=ROAD
    this.state['tabList']=roadTabs
    this.state['activeTab']=roadTabs[0].name

    this.handleEdit=this.handleEdit.bind(this)
    this.handleSubmitEconomy=this.handleSubmitEconomy.bind(this)
    this.handleSubmitDistance=this.handleSubmitDistance.bind(this)
    this.handleSubmitFlightHrs=this.handleSubmitFlightHrs.bind(this)
    this.handleEmissionSave=this.handleEmissionSave.bind(this)
    this.handleAircraftInput=this.handleAircraftInput.bind(this)
    this.handleAirOptions=this.handleAirOptions.bind(this)
    this.exitCalculator=this.exitCalculator.bind(this)
    this.handleTabClick=this.handleTabClick.bind(this)
    this.createClone=this.createClone.bind(this)
    this.handleModeChange=this.handleModeChange.bind(this)
    this.nextTab=this.nextTab.bind(this)
    this.prevTab=this.prevTab.bind(this)
    this.isFirstTab=this.isFirstTab.bind(this)
    this.isLastTab=this.isLastTab.bind(this)
  }

  nextTab(){
    let tabList = this.state.tabList
    for(let i=0; i<(tabList.length-1); i++){
      if(this.state.activeTab===tabList[i].name){
        this.setState({activeTab:tabList[i+1].name})
      }
    }
  }

  prevTab(){
    let tabList = this.state.tabList
    for(let i=0; i<(tabList.length); i++){
      if(this.state.activeTab===tabList[i].name){
        if(i===0){return}
        this.setState({activeTab:tabList[i-1].name})
      }
    }
  }

  exitCalculator(){
    this.setState({redirect:urls.NAV_HOME})
  }

  createClone(json){
    console.log(json)

    let modal = 
      <EmissionEdit 
        emission={json} 
        displayUnits={this.props.displayUnits} 
        profile={this.props.profile} 
        taxes={this.props.taxes} 
        hideModal={this.props.hideModal} 
        refresh={this.props.refresh}
        fuels={this.props.fuels}
      />
  
    this.props.setModal(modal)
  }

  handleEmissionSave(json){
    let sym = this.props.profile.currency_symbol
    let price = this.props.profile.conversion_factor*json.price
    console.log(json)

    let title=<div>Emission Saved!</div>
    let body = 
      <div>
        <p>{json.date} - {json.name}</p>
        <p>{json.co2_output_kg}kg CO2, {sym}{price.toFixed(2)}</p>
      </div>
    let footer = 
      <div>
        <button className="btn btn-outline-info" onClick={() => this.createClone(json)}>Edit/Clone</button>
        <button className="btn btn-outline-success" onClick={this.props.hideModal}>Close</button>
      </div>
    this.props.setModal(<StandardModal title={title} body={body} footer={footer} hideModal={this.props.hideModal}/>)
    this.props.refresh()
    this.exitCalculator()
  }

  handleSubmitEconomy(vehicle){
    console.log(vehicle)
    this.setState({
      vehicle:vehicle,
      economySubmitted:true,
    },this.nextTab);
  }

  handleSubmitDistance(origin, destination, distanceKm, wasReturnTrip){
    /* Expects to receive distance in km */
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
      returnTrip: wasReturnTrip,
    },this.nextTab)
  }

  handleSubmitFlightHrs(hrs){
    this.setState({
      flightHrs:hrs,
      distanceSubmitted:true,
      returnTrip:false,
    },this.nextTab)
  }

  handleAircraftInput(aircraftType, returnFields){
    this.setState({
      aircraftType:aircraftType,
      aircraftFields:returnFields,
      aircraftSubmitted:true,
    },this.nextTab)
  }

  handleAirOptions(returnFields){
    this.setState({
      airOptions:returnFields,
      airOptionsSubmitted:true,
    },this.nextTab)
  }

  handleEdit(event){
    this.setState({[`${this.state.activeTab}Submitted`]:false})
  }

  handleTabClick(event){
    //this.setState({activeTab:event.target.name})
  }

  handleModeChange(event){
    this.setState(this.defaultState)
    let mode = event.target.value
    let activeTab, tabList
    if(mode===ROAD){
      tabList=roadTabs
    }else if(mode===AIR){
      tabList=airTabs
    }
    this.setState({
      mode:mode,
      tabList:tabList,
      activeTab:tabList[0].name,
    })
  }

  isFirstTab(){return this.state.tabList[0].name===this.state.activeTab}
  isLastTab(){return this.state.tabList[this.state.tabList.length-1].name===this.state.activeTab}

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>

    let displayUnits=this.props.displayUnits
    let navBtns = 
      <div className="row">
        {this.isFirstTab() ? "" : <button className="btn btn-outline-danger m-2" onClick={this.prevTab} >Back</button>}
        {this.state.activeTab==="carbon" ? "" : <button className="btn btn-outline-primary m-2" onClick={this.handleEdit} >Edit</button>}
        {this.isLastTab() ? "" : <button className="btn btn-success m-2" onClick={this.nextTab} >Continue</button>}
      </div>

    let tabDisplay
    
    if(this.state.activeTab==="economy"){
      if(this.state.economySubmitted){
        let fuelName=getAttribute({objectList:this.props.fuels, key:"id", keyValue:this.state.vehicle.fuel, attribute:"name"})

        tabDisplay = 
          <div className="container bg-light" >
            <h3>{parseFloat(units.convert(this.state.vehicle.economy, displayUnits)).toFixed(1)} {units.string(displayUnits)}, {fuelName}</h3>
            {navBtns}
          </div>
      } else {
        tabDisplay = 
          <EconomyInput
            returnVehicle={this.handleSubmitEconomy}
            displayUnits={displayUnits}
            loggedIn={this.props.loggedIn}
            vehicles={this.props.vehicles}
            fuels={this.props.fuels}
            refresh={this.props.refresh}
            setModal={this.props.setModal}
            hideModal={this.props.hideModal}
            prevTab={this.prevTab}
            initialValues={this.state.vehicle}
          />
      }
    }
    
    if(this.state.activeTab==="distance"){
      tabDisplay = this.state.distanceSubmitted ?
        <div className="container bg-light" >
          {(this.state.mode===AIR && this.state.aircraftType!=="airliner") ?
            <p>Flight time: {displayHrs(this.state.flightHrs)}</p>
            :
            <p>{parseFloat(units.distanceDisplay(this.state.distanceKm, displayUnits)).toFixed(0)} {units.distanceString(displayUnits)}</p>
          }
          {navBtns}
        </div>
        :
        <DistanceInput  
          locationBias={this.props.loggedIn&&this.props.profile.loc_lat ? {lat:this.props.profile.loc_lat,lng:this.props.profile.loc_lng} : null}
          submitDistance={this.handleSubmitDistance}
          submitFlightHrs={this.handleSubmitFlightHrs}
          displayUnits={displayUnits}
          submitted={this.state.distanceSubmitted}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
          mode={this.state.mode}
          prevTab={this.prevTab}
          inputHrs={(this.state.mode===AIR && this.state.aircraftType!=="airliner")}
          initialValue={(this.state.mode===AIR && this.state.aircraftType!=="airliner") ? this.state.flightHrs : this.state.distanceKm}
        />
    }
    
    if(this.state.activeTab==="carbon"){
      let formsComplete = (
        (this.state.mode===ROAD && this.state.economySubmitted && this.state.distanceSubmitted)
        || (this.state.mode===AIR && this.state.aircraftSubmitted && this.state.distanceSubmitted && this.state.airOptionsSubmitted)
      )

      tabDisplay = formsComplete ?
        <CarbonCalculator 
          origin={this.state.origin}
          destination={this.state.destination}
          returnTrip={this.state.wasReturnTrip}

          mode={this.state.mode}
          distanceKm={this.state.distanceKm}
          fuelId={this.state.vehicle?this.state.vehicle.fuel:null}
          lPer100Km={this.state.vehicle?this.state.vehicle.economy:null}
          flightHrs={this.state.flightHrs}
          aircraftType={this.state.aircraftType}
          aircraftFields={this.state.aircraftFields}
          airOptions={this.state.airOptions}
          
          displayUnits={displayUnits} 
          loggedIn={this.props.loggedIn} 
          submitCarbon={this.handleEmissionSave} 
          taxCategory={taxes.getCategoryName(this.state.mode)}
          taxes={this.props.taxes}
          fuels={this.props.fuels}  
          profile={this.props.profile}
          
          refresh={this.props.refresh}
          prevTab={this.prevTab}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
       :
       <div className="container bg-light" >
        <p>Complete all sections to calculate carbon output.</p>
        {navBtns}
       </div>
    }

    if(this.state.activeTab==="aircraft"){
      tabDisplay = !this.state.aircraftSubmitted ?
        <AircraftInput
          returnAircraft={this.handleAircraftInput}
          prevTab={this.prevTab}
          initialValues={{
            aircraftType:this.state.aircraftType,
            airlinerClass:this.state.aircraftFields.airlinerClass,
            totalSeats:this.state.aircraftFields.totalSeats,
            passengers:this.state.aircraftFields.passengers,
          }}
        />
        :
        <div className="container bg-light" >
          <p>{getAttribute({objectList:aircraftTypes, key:"type", keyValue:this.state.aircraftType, attribute:"label"})}</p>
          {this.state.aircraftType==="airliner" ?
            <p>Fare: {getAttribute({objectList:airlinerClasses, key:"class", keyValue:this.state.aircraftFields.airlinerClass, attribute:"label"})}</p>
            :
            <p>{this.state.aircraftFields.passengers}/{this.state.aircraftFields.totalSeats} seats filled.</p>
          }
          {navBtns}
        </div>
    }

    if(this.state.activeTab==="airOptions"){
      tabDisplay = !this.state.airOptionsSubmitted ?
        <AirOptionsInput
          returnOptions={this.handleAirOptions}
          aircraftType={this.state.aircraftType}
          aircraftFields={this.state.aircraftFields}
          distanceKm={this.state.distanceKm}
          prevTab={this.prevTab}
          initialValues={{
            offset:this.state.airOptions.offset,
            multiplier:this.state.airOptions.multiplier,
          }}
        />
        :
        <div className="container bg-light" >
          <p>Offset: {this.props.profile.currency_symbol}{parseFloat(this.state.airOptions.offset).toFixed(2)}</p>
          <p>RF Multiplier: {this.state.airOptions.multiplier}</p>
          {navBtns}
        </div>
    }
    
    return(
      <div>
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Carbon Tax Calculator
          </Navbar.Brand>
          <ObjectSelectionList list={emissionModes} value="mode" label="label" defaultValue={ROAD} onChange={this.handleModeChange}/>
        </Navbar>
        </div>
        <TabbedNavBar tabs={this.state.tabList} activeTab={this.state.activeTab} onTabClick={this.handleTabClick}/>
        {tabDisplay}
      </div>
    );
  }
}
