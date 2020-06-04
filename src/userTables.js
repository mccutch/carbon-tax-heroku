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
const PAGINATATION_RESULTS_PER_PAGE = 5 // change this with settings.py

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

export class PaginatedTableHeader extends React.Component{
  constructor(props){
    super(props)
    
    this.state = {
      newPageNumber:null,
    }
    
    this.handleClick=this.handleClick.bind(this)
    this.getNextPage=this.getNextPage.bind(this)
    this.returnPage=this.returnPage.bind(this)
  }


  handleClick(event){
    console.log(event.target.name)
    // if button state is active
    if(event.target.name==="prev"){
      this.setState({
        newPageNumber:this.props.page-1
      })
      this.getNextPage(this.props.tableData.previous)
    } else if(event.target.name==="next"){
      this.setState({
        newPageNumber:this.props.page+1
      })
      this.getNextPage(this.props.tableData.next)
    }
  }

  getNextPage(url){
    fetchObject({
      url:url,
      method:'GET',
      onSuccess:this.returnPage,
    })
  }

  returnPage(json){
    this.props.returnPage(json, this.state.newPageNumber)
    
    this.setState({
      newPageNumber:null,
    })
  }

  disablableItem(link){
    if(link){
      return "page-item"
    } else {
      return "page-item disabled"
    }
  }

  render(){
    //let resultsPerPage = this.props.tableData.results.length
    let resultsPerPage = PAGINATATION_RESULTS_PER_PAGE
    let firstResult = 1 + (this.props.page-1)*(resultsPerPage)
    let lastResult = firstResult+this.props.tableData.results.length-1

    let displayedResultsString
    let plural
    if(this.props.tableData.results.length>1){
      displayedResultsString = `${firstResult.toString()}-${(lastResult).toString()}`
      plural = "s"
    } else {
      displayedResultsString = `${firstResult.toString()}`
    }

    let prevActive
     
    return(
      <div className="container my-2 py-2 bg-dark">
        <nav aria-label="Table navigation" className="row">
          <p className="text-light px-2">Showing result{plural} {displayedResultsString} of {this.props.tableData.count}</p>
          <ul className="pagination px-2">
            <li className={this.disablableItem(this.props.tableData.previous)}><a className="page-link" name="prev" onClick={this.handleClick}>Previous</a></li>
            <li className={this.disablableItem(this.props.tableData.next)}><a className="page-link" name="next" onClick={this.handleClick}>Next</a></li>
          </ul>
        </nav>
      </div>
    )
  }
}


export class EmissionTable extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      displayedEmissions:[],
      page:1,
    }
    this.buildRows=this.buildRows.bind(this)
    this.changePage=this.changePage.bind(this)
  }

  changePage(emissionsToDisplay, newPage){
    this.setState({
      displayedEmissions:emissionsToDisplay,
      page:newPage,
    })
  }

  componentDidMount(){
    this.setState({displayedEmissions:this.props.emissions})
  }

  buildRows(){
    let emissions = this.state.displayedEmissions.results
    let tableRows=[]
    for(let i in emissions){
      tableRows.push(
        <EmissionDetail emission={emissions[i]} displayUnits={this.props.displayUnits} />
      )
    }
    return tableRows
  }

  render(){
    let paginatedTableHeader
    if(this.state.displayedEmissions.length !== 0){
      paginatedTableHeader = <PaginatedTableHeader tableData={this.state.displayedEmissions} page={this.state.page} returnPage={this.changePage} />
    }

    return(
      <div>
        {paginatedTableHeader}
        <ObjectTable tableRows={this.buildRows()} headers={["Trip Name", "Date", "Travel Mode", "Distance", "CO2 Output", "Tax"]} />
      </div>
    )
  }
}

