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
    this.props.app.setModal(<TaxEdit tax={this.props.tax} app={this.props.app} userData={this.props.userData} />)
  }

  render(){
    let tax = this.props.tax
    let sym = this.props.userData.profile.currency_symbol
    let currencyFactor = this.props.userData.profile.conversion_factor
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
            app={this.props.app}
          />
    this.props.app.setModal(modal)
  }

  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.props.vehicle.fuel, this.props.vehicle.name)
    if(this.props.app.hideModal){
      this.props.app.hideModal()
    }
  }

  render(){
    let vehicle=this.props.vehicle
    let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.app.displayUnits)

    let vehicleName
    if(this.props.submitEconomy){
      vehicleName=<td className="align-middle"><button className="btn btn-outline-primary m-2 btn-block" onClick={this.useVehicle}>{vehicle.name}</button></td>
    } else {
      vehicleName=<td className="align-middle"><button className="btn btn-outline-primary m-2 btn-block" onClick={this.edit}>{vehicle.name}</button></td>
    }

    return(
      <tr key={vehicle.id}>
        {vehicleName}
        <td className="align-middle">{economy.toFixed(1)} {units.displayUnitString(this.props.app.displayUnits)}</td>
        <td className="align-middle">{getAttribute({key:"id", keyValue:vehicle.fuel, objectList:this.props.app.fuels, attribute:"name"})}</td>
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
    this.props.app.setModal(<EmissionEdit emission={this.props.emission} app={this.props.app} userData={this.props.userData} />)
  }

  render(){
    let displayUnits=this.props.app.displayUnits
    let emission=this.props.emission
    let sym=this.props.userData.profile.currency_symbol
    let currencyFactor = this.props.userData.profile.conversion_factor

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
          <td className="align-middle">{getAttribute({key:"id", keyValue:emission.tax_type, objectList:this.props.userData.taxes, attribute:"name"})}</td>
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
    this.props.app.setModal(<PaymentEdit payment={this.props.payment} app={this.props.app} userData={this.props.userData} />)
  }

  render(){
    let payment = this.props.payment
    return(
      <tr key={payment.id}>
        <td className="align-middle">{payment.date}</td>
        <td className="align-middle">{getAttribute({key:"id", keyValue:payment.recipient, objectList:this.props.userData.recipients, attribute:"name"})}</td>
        <td className="align-middle">{displayCurrency(payment.amount, this.props.userData.profile)}</td>
        <td className="align-middle"><button className="btn btn-outline-primary m-2" onClick={this.edit}>Edit</button></td>
      </tr>
    )
  }
}