import React from 'react';
import { TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import * as units from './unitConversions';
import { getAttribute, displayCurrency, encodeEmissionFormat, displayHrs } from './helperFunctions.js';
import { EmissionEdit, TaxEdit, PaymentEdit, VehicleEdit} from './objectEdit.js';

export class TaxDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
      newValue:null,
      error:false,
    }
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <TaxEdit 
            tax={this.props.tax}
            taxes={this.props.taxes}
            profile={this.props.profile}
            hideModal={this.props.hideModal} 
            setModal={this.props.setModal}
            refresh={this.props.refresh}
          />
    this.props.setModal(modal)
  }

  render(){
    let tax = this.props.tax
    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor
    let taxName = <button className="btn btn-outline-primary btn-block m-2" onClick={this.edit}>{tax.name}</button>

    return(
      <tr key={tax.id} >
        <td className="align-middle">{taxName}</td>
        <td className="align-middle">{sym}{parseFloat(currencyFactor*tax.price_per_kg).toFixed(3)}/kg CO2</td>
        <td className="align-middle">{tax.category}</td>
      </tr>
    )
  }
}




export class VehicleDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
    }

    this.useVehicle=this.useVehicle.bind(this)
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <VehicleEdit 
            vehicle={this.props.vehicle}
            displayUnits={this.props.displayUnits}
            fuels={this.props.fuels}
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
          />
    this.props.setModal(modal)
  }

  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.props.vehicle.fuel, this.props.vehicle.name)
    if(this.props.hideModal){
      this.props.hideModal()
    }
  }

  render(){
    let vehicle=this.props.vehicle
    let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.displayUnits)

    let vehicleName
    if(this.props.submitEconomy){
      vehicleName=<td className="align-middle"><button className="btn btn-outline-primary m-2 btn-block" onClick={this.useVehicle}>{vehicle.name}</button></td>
    } else {
      vehicleName=<td className="align-middle"><button className="btn btn-outline-primary m-2 btn-block" onClick={this.edit}>{vehicle.name}</button></td>
    }

    return(
      <tr key={vehicle.id}>
        {vehicleName}
        <td className="align-middle">{economy.toFixed(1)} {units.displayUnitString(this.props.displayUnits)}</td>
        <td className="align-middle">{getAttribute({key:"id", keyValue:vehicle.fuel, objectList:this.props.fuels, attribute:"name"})}</td>
      </tr>
    )
  }
}




export class EmissionDetail extends React.Component{
  constructor(props){
    super(props)
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <EmissionEdit 
            emission={this.props.emission} 
            displayUnits={this.props.displayUnits} 
            profile={this.props.profile} 
            taxes={this.props.taxes} 
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
            fuels={this.props.fuels}
          />
    this.props.setModal(modal)
  }

  render(){
    let displayUnits=this.props.displayUnits
    let emission=this.props.emission
    let sym=this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    let distance
    let format = this.props.emission.format_encoding
    if(format===encodeEmissionFormat("road") || format===encodeEmissionFormat("airDistance")){
      let dist=units.distanceDisplay(emission.distance, displayUnits)
      let distString=units.distanceString(displayUnits)
      distance = `${parseFloat(dist).toFixed(1)}${distString}`
    }else if(format===encodeEmissionFormat("airTime")){
      distance = displayHrs(this.props.emission.distance)
    }

    let display = 
        <tr key={emission.id}>
          <td className="align-middle"><button className="btn btn-outline-primary m-2 btn-block" onClick={this.edit}>{emission.name}</button></td>
          <td className="align-middle">{emission.date}</td>
          <td className="align-middle">{getAttribute({key:"id", keyValue:emission.tax_type, objectList:this.props.taxes, attribute:"name"})}</td>
          <td className="align-middle">{sym}{parseFloat(currencyFactor*emission.price).toFixed(2)}</td>
        </tr>
    
    return display
  }
}

export class PaymentDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <PaymentEdit 
            payment={this.props.payment}
            profile={this.props.profile}
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
            recipients={this.props.recipients}
          />
    this.props.setModal(modal)
  }

  render(){
    let payment = this.props.payment
    return(
      <tr key={payment.id}>
        <td className="align-middle">{payment.date}</td>
        <td className="align-middle">{getAttribute({key:"id", keyValue:payment.recipient, objectList:this.props.recipients, attribute:"name"})}</td>
        <td className="align-middle">{displayCurrency(payment.amount, this.props.profile)}</td>
        <td className="align-middle"><button className="btn btn-outline-primary m-2" onClick={this.edit}>Edit</button></td>
      </tr>
    )
  }
}