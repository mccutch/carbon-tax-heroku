import React from 'react';
import {Modal, Navbar} from 'react-bootstrap';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {AircraftInput, AirOptionsInput} from './aircraftInput.js';
import {CarbonCalculator} from './carbonCalculator.js';
import * as units from './unitConversions';
import * as taxes from './defaultTaxTypes.js';
import {EmissionEdit} from './objectDetail.js';
import {ObjectSelectionList} from './reactComponents.js';
import {TabbedNavBar} from './navBar.js';

//Carbon emission modes
import {ROAD, AIR, PUBLIC, OTHER} from './constants.js';


export class EmissionCalculator extends React.Component{
  constructor(props){
    super(props);
    this.defaultState = {
      lPer100km: 0,
      fuelId: null,
      origin: null,
      destination: null,
      distanceKm: null,
      economySubmitted: false,
      distanceSubmitted: false,
      aircraftSubmitted: false,
      airOptionsSubmitted: false,
      returnTrip: false,
    }

    this.state=this.defaultState
    this.state['mode']=ROAD
    this.state['activeTab']="distance"

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
    this.newEmission=this.newEmission.bind(this)
    this.handleModeChange=this.handleModeChange.bind(this)
  }

  exitCalculator(){
    this.props.exit()
  }

  newEmission(event){
    this.props.hideModal()
    this.props.selectView(event)
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
    let modal = 
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header className="bg-primary text-light" closeButton>
          <Modal.Title>Emission Saved!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{json.date} - {json.name}</p>
          <p>{json.co2_output_kg}kg CO2, {sym}{price.toFixed(2)}</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-info" onClick={() => this.createClone(json)}>Edit/Clone</button>
          <button className="btn btn-outline-info" name="emissionCalculator" onClick={this.newEmission}>New emission</button>
          <button className="btn btn-outline-success" onClick={this.props.hideModal}>Close</button>
        </Modal.Footer>
      </Modal>
    this.props.setModal(modal)
    this.props.exit()
  }

  handleSubmitEconomy(lper100km, fuelId){
    this.setState({
      lPer100km: lper100km,
      fuelId: fuelId,
      economySubmitted: true,
      activeTab:"carbon",
    });
  }

  handleSubmitDistance(origin, destination, distanceKm, wasReturnTrip){
    /* Expects to receive distance in km */
    let nextTab
    if(this.state.mode===ROAD){
      nextTab="economy"
    } else if(this.state.mode===AIR){
      nextTab="air-options"
    }
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
      returnTrip: wasReturnTrip,
      activeTab:nextTab,
    })
  }

  handleSubmitFlightHrs(hrs){
    this.setState({
      flightHrs:hrs,
      distanceSubmitted:true,
      returnTrip:false,
      activeTab:"air-options"
    })
  }

  handleAircraftInput(aircraftType, returnFields){
    this.setState({
      aircraftType:aircraftType,
      aircraftFields:returnFields,
      aircraftSubmitted:true,
      activeTab:"distance",
    })
  }

  handleAirOptions(returnFields){
    this.setState({
      airOptions:returnFields,
      airOptionsSubmitted:true,
      activeTab:"carbon"
    })
  }


  handleEdit(event){
    if(event.target.name==="economy"){
      this.setState({economySubmitted:false})
    } else if(event.target.name==="distance"){
      this.setState({distanceSubmitted:false})
    }
  }

  handleTabClick(event){
    this.setState({activeTab:event.target.name})
  }

  handleModeChange(event){
    this.setState(this.defaultState)
    let mode = event.target.value
    let activeTab
    if(mode===ROAD){
      activeTab="distance"
    }else if(mode===AIR){
      activeTab="aircraft"
    }
    this.setState({
      mode:mode,
      activeTab:activeTab,
    })
  }

  render(){
    let displayUnits=this.props.displayUnits

    let tabDisplay
    
    if(this.state.activeTab==="economy"){
      let economyInput
      if(this.state.economySubmitted){
        let fuelName=this.props.fuels[parseInt(this.state.fuelId)-1].name

        economyInput = 
          <div className="container bg-light" >
            <div className="row">
              <h3>
                {parseFloat(units.convert(this.state.lPer100km, displayUnits)).toFixed(1)} {units.string(displayUnits)}, {fuelName}
              </h3>
              <button
                type="button"
                name="economy"
                className="btn btn-outline-primary m-2"
                onClick={this.handleEdit}
              >Edit</button>
            </div>
          </div>
      } else {
        economyInput = <EconomyInput
                          submitEconomy={this.handleSubmitEconomy}
                          displayUnits={displayUnits}
                          loggedIn={this.props.loggedIn}
                          vehicles={this.props.vehicles}
                          fuels={this.props.fuels}
                          refresh={this.props.refresh}
                          setModal={this.props.setModal}
                          hideModal={this.props.hideModal}
                        />
      }
      tabDisplay = economyInput
    }
    
    if(this.state.activeTab==="distance"){
      let distanceDisplay
      if(this.state.distanceSubmitted){
        let display
        if(this.state.mode===AIR && this.state.aircraftType!=="airliner"){
          display = <h3>{parseFloat(this.state.flightHrs).toFixed(2)}hrs</h3>
        } else {
          display = <h3>{parseFloat(units.distanceDisplay(this.state.distanceKm, displayUnits)).toFixed(0)} {units.distanceString(displayUnits)}</h3>
        }
        distanceDisplay = 
          <div className="container bg-light" >
            <div className="row">
                {display}
              <button
                type="button"
                name="distance"
                className="btn btn-outline-primary m-2"
                onClick={this.handleEdit}
              >Edit</button>
            </div>
          </div>
      } else {
        distanceDisplay = <DistanceInput  
                            submitDistance={this.handleSubmitDistance}
                            submitFlightHrs={this.handleSubmitFlightHrs}
                            displayUnits={displayUnits}
                            submitted={this.state.distanceSubmitted}
                            setModal={this.props.setModal}
                            hideModal={this.props.hideModal}
                            mode={this.state.mode}
                            aircraftType={this.state.aircraftType}
                          />
      }
      tabDisplay = distanceDisplay
    }

    
    if(this.state.activeTab==="carbon"){

      let formsComplete = (
        (this.state.mode===ROAD && this.state.economySubmitted && this.state.distanceSubmitted)
        || (this.state.mode===AIR && this.state.aircraftSubmitted && this.state.distanceSubmitted && this.state.airOptionsSubmitted)
      )?true:false
      
      

      let carbonResult 
      if(formsComplete){
        carbonResult = 
          <div>
            <CarbonCalculator 
              data={this.state} 
              displayUnits={displayUnits} 
              loggedIn={this.props.loggedIn} 
              submitCarbon={this.handleEmissionSave} 
              taxCategory={taxes.getCategoryName(this.state.mode)}
              taxes={this.props.taxes}
              fuels={this.props.fuels}
              refresh={this.props.refresh}
              profile={this.props.profile}
              mode={this.state.mode}
              aircraftType={this.state.aircraftType}
              aircraftFields={this.state.aircraftFields}
              airOptions={this.state.airOptions}
            />
          </div>
      } else {
        carbonResult = <p>Complete distance and fuel economy sections to calculate carbon output.</p>
      }
      tabDisplay = carbonResult
    }

    if(this.state.activeTab==="aircraft"){
      tabDisplay =  <AircraftInput
                      //displayUnits={displayUnits}
                      returnAircraft={this.handleAircraftInput}
                      //submitted={this.state.distanceSubmitted}
                      //setModal={this.props.setModal}
                      //hideModal={this.props.hideModal}
                    />
    }

    if(this.state.activeTab==="air-options"){
      tabDisplay =  <AirOptionsInput
                      //displayUnits={displayUnits}
                      returnOptions={this.handleAirOptions}
                      aircraftType={this.state.aircraftType}
                      aircraftFields={this.state.aircraftFields}
                      distanceKm={this.state.distanceKm}
                      //submitted={this.state.distanceSubmitted}
                      //setModal={this.props.setModal}
                      //hideModal={this.props.hideModal}
                    />
    }

    let emissionModes = [
      {mode:ROAD, label:"Private Vehicle"},
      {mode:AIR, label:"Air Travel"},
      //{mode:PUBLIC, label:"Public Transport"},
      //{mode:OTHER, label:"Miscellaneous"},
    ]

    let navTabs
    if(this.state.mode===ROAD){
      navTabs = [
        {name:"distance", label:"Distance"}, 
        {name:"economy", label:"Economy"}, 
        {name:"carbon", label:"Carbon"}
      ]
    }else if(this.state.mode===AIR){
      navTabs = [
        {name:"aircraft", label:"Aircraft"},
        {name:"distance", label:"Distance"}, 
        {name:"air-options", label:"Options"}, 
        {name:"carbon", label:"Carbon"},
      ]
    }
    
    return(
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Carbon Tax Calculator
          </Navbar.Brand>
          <ObjectSelectionList list={emissionModes} value="mode" label="label" defaultValue={ROAD} onChange={this.handleModeChange}/>
        </Navbar>
        </div>
        <TabbedNavBar tabs={navTabs} activeTab={this.state.activeTab} onTabClick={this.handleTabClick}/>
        {tabDisplay}

      </div>
    );
  }
}
