import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import {refreshToken} from './myJWT.js';
import { VehicleInput } from './vehicleInput.js';
import * as units from './unitConversions';
import { VehicleSaveForm } from './vehicleSave.js';
import { createObject } from './helperFunctions.js';
import {fetchObject} from './helperFunctions.js';
import {ECONOMY_DECIMALS} from './fuelTypes.js';

import { TaxDetail, VehicleDetail, EmissionDetail } from './objectDetail.js';
import { CreateTax, CreateVehicle } from './objectCreate.js';

const MAX_NAME_LEN = 30

/*
Table and accessory components for listing, using and editing objects belonging to a user.


TaxTable
  ObjectTable
    TaxDetail
      CreateTax

VehicleTable
  ObjectTable
    VehicleDetail
      Create Vehicle



*/

class ObjectTable extends React.Component{

  buildHeader(){
    let headers = this.props.headers
    let headerCols = []
    for(let i in headers){
      headerCols.push(<th>{headers[i]}</th>)
    }
    return <tr>{headerCols}</tr>
  }

  render(){
    return(
      <div className="table-responsive">
        <table className="table table-light">
          <thead className="thead-dark">
            {this.buildHeader()}
          </thead>
          <tbody>
            {this.props.tableRows}
          </tbody>
        </table>
      </div>
    )
  }
}

export class TaxTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let taxes = this.props.taxes
    let tableRows=[]
    if(taxes){
      for(let i=0; i<taxes.length; i++){
        tableRows.push(<TaxDetail key={taxes[i].id} tax={taxes[i]} refresh={this.props.refresh}/>)
      }
    }
    tableRows.push(<tr><CreateTax buttonLabel={"+ New Tax"} refresh={this.props.refresh} existingTaxes={this.props.taxes}/></tr>)
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Name", "Price", "Category", ""]}/>
    )
  }
}









export class VehicleTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let tableRows=[]
    let vehicles=this.props.vehicles
    for(let i=0; i<vehicles.length; i++){
      tableRows.push(
        <VehicleDetail 
          key={vehicles[i].id} 
          vehicle={vehicles[i]} 
          submitEconomy={this.props.submitEconomy} 
          displayUnits={this.props.displayUnits}
          fuels={this.props.fuels}
          refresh={this.props.refresh}
        />
      )
    }
    tableRows.push(<tr><CreateVehicle displayUnits={this.props.displayUnits} fuels={this.props.fuels} refresh={this.props.refresh}/></tr>)
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Name", "Economy", "Fuel", ""]} />
    )
  }
}




export class EmissionTable extends React.Component{
  constructor(props){
    super(props)
    this.buildRows=this.buildRows.bind(this)
  }

  buildRows(){
    let emissions=this.props.emissions.results
    let tableRows=[]
    for(let i in emissions){
      tableRows.push(
        <EmissionDetail emission={emissions[i]} displayUnits={this.props.displayUnits} />
      )
    }
    return tableRows
  }

  render(){
    return(
      <ObjectTable tableRows={this.buildRows()} headers={["Trip Name", "Date", "Travel Mode", "Distance", "CO2 Output", "Tax"]} />
    )
  }
}

