import React from 'react';
import {Modal, Navbar} from 'react-bootstrap';
import {EconomyInput} from './economyInput.js';
import {DistanceInput} from './distanceInput.js';
import {CarbonCalculator} from './carbonCalculator.js';
import * as units from './unitConversions';
import * as taxes from './defaultTaxTypes.js';
import {EmissionEdit} from './objectDetail.js';

export class EmissionCalculator extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      lPer100km: 0,
      fuelId: null,
      origin: null,
      destination: null,
      distanceKm: null,
      economySubmitted: false,
      distanceSubmitted: false,
      returnTrip: false,
      activeTab:"distance",
    }
    
    this.handleEdit=this.handleEdit.bind(this)
    this.handleSubmitEconomy=this.handleSubmitEconomy.bind(this)
    this.handleSubmitDistance=this.handleSubmitDistance.bind(this)
    this.handleEmissionSave=this.handleEmissionSave.bind(this)
    this.exitCalculator=this.exitCalculator.bind(this)
    this.makeTab=this.makeTab.bind(this)
    this.handleTabClick=this.handleTabClick.bind(this)
    this.createClone=this.createClone.bind(this)
    this.newEmission=this.newEmission.bind(this)
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
    this.setState({
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      distanceSubmitted: true,
      returnTrip: wasReturnTrip,
      activeTab:"economy",
    })
  }

  handleEdit(event){
    if(event.target.name==="economy"){
      this.setState({economySubmitted:false})
    } else if(event.target.name==="distance"){
      this.setState({distanceSubmitted:false})
    }
  }

  makeTab(name, label){
    let className
    if(this.state.activeTab === name){
      className="nav-link active"
    } else {
      className="nav-link"
    }
    return <strong><a name={name} className={className} onClick={this.handleTabClick}>{label}</a></strong>
  }

  handleTabClick(event){
    this.setState({activeTab:event.target.name})
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
        distanceDisplay = 
          <div className="container bg-light" >
            <div className="row">
              <h3>
                {parseFloat(units.distanceDisplay(this.state.distanceKm, displayUnits)).toFixed(0)} {units.distanceString(displayUnits)}
              </h3>
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
                            displayUnits={displayUnits}
                            submitted={this.state.distanceSubmitted}
                            setModal={this.props.setModal}
                            hideModal={this.props.hideModal}
                          />
      }
      tabDisplay = distanceDisplay
    }

    
    if(this.state.activeTab==="carbon"){
      let carbonResult 
      if(this.state.economySubmitted && this.state.distanceSubmitted){
        carbonResult = 
          <div>
            <CarbonCalculator 
              data={this.state} 
              displayUnits={displayUnits} 
              loggedIn={this.props.loggedIn} 
              submitCarbon={this.handleEmissionSave} 
              taxCategory={taxes.getCategoryName("road-travel")}
              taxes={this.props.taxes}
              fuels={this.props.fuels}
              refresh={this.props.refresh}
              profile={this.props.profile}
            />
          </div>
      } else {
        carbonResult = <p>Complete distance and fuel economy sections to calculate carbon output.</p>
      }
      tabDisplay = carbonResult
    }
    
    return(
      /*<div className="container-sm bg-light my-2">
        <div className="row mx-2">
          <h3>Carbon Tax Calculator</h3>
          <button type="button" className="btn btn-outline-danger m-2" onClick={this.exitCalculator}>Exit</button>
        </div>
        */
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Carbon Tax Calculator
          </Navbar.Brand>
        </Navbar>
        </div>
      
        <ul className="nav nav-tabs">
          <li className="nav-item">
            {this.makeTab("distance", "Distance")}
          </li>
          <li className="nav-item">
            {this.makeTab("economy", "Economy")}
          </li>
          <li className="nav-item">
            {this.makeTab("carbon", "Carbon")}
          </li>
        </ul>
        {tabDisplay}
      </div>
    );
  }
}
