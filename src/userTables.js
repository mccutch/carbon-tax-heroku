import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { fetchObject } from './helperFunctions.js';
import { TaxDetail, VehicleDetail, EmissionDetail } from './objectDetail.js';
import { CreateTax, CreateVehicle } from './objectCreate.js';
import * as getDate from './getDate.js';

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
    this.createNew=this.createNew.bind(this)
  }

  createNew(){
    let modal = 
      <CreateTax 
        buttonLabel={"+ New Tax"} 
        refresh={this.props.refresh} 
        existingTaxes={this.props.taxes}
        hideModal={this.props.hideModal}
      />
    this.props.setModal(modal)
  }

  buildRows(){
    let taxes = this.props.taxes
    let tableRows=[]
    if(taxes){
      for(let i=0; i<taxes.length; i++){
        tableRows.push(
          <TaxDetail 
            key={taxes[i].id} 
            tax={taxes[i]} 
            allTaxes={this.props.taxes}
            refresh={this.props.refresh} 
            profile={this.props.profile}
            setModal={this.props.setModal}
            hideModal={this.props.hideModal}
          />)
      }
    }
    tableRows.push(
      <tr>
        <button className="btn btn-outline-primary" onClick={this.createNew}>+ Create Tax</button>
      </tr>
    )
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
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
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




export class EmissionFilterNav extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      showFilters:true,
      searchQuery:"",
      taxFilter:"",
      startDate:"",
      endDate:"",
    }

    this.handleChange=this.handleChange.bind(this)
    this.makeTaxList=this.makeTaxList.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.clearFilters=this.clearFilters.bind(this)
    this.search=this.search.bind(this)
    this.returnResults=this.returnResults.bind(this)
    this.editTaxFilter=this.editTaxFilter.bind(this)

    this.defaultTaxDisplayText = "All Taxes"
  }


  makeTaxList(){
    let taxes = this.props.taxes
    let taxList=[this.defaultTaxDisplayText]
    for(let i in taxes){
      taxList.push(taxes[i].name)
    }
    return taxList
  }

  handleChange(event){
    let property = event.target.name
    let value = event.target.value

    this.setState({
      [property]:value
    }) 
  }

  editTaxFilter(event){
    let value = event.target.value

    if(value===this.defaultTaxDisplayText){
      value=""
    }

    this.setState({
      taxFilter:value
    })
  }

  handleClick(event){
    event.preventDefault()
    if(event.target.name==="search"){
      this.search()
    } else if(event.target.name==="clearAll"){
      this.clearFilters()
    } else if(event.target.name==="hideFilters"){
      this.setState({showFilters:false})
      this.clearFilters()
    } else if(event.target.name==="showFilters"){
      this.setState({showFilters:true})
    }
  }

  clearFilters(){
    this.props.returnResults(this.props.default)
    this.setState({
      searchQuery:"",
      taxFilter:"",
      startDate:"",
      endDate:"",
    })
    document.getElementById("searchQuery").value = ""
    document.getElementById("taxFilter").value = this.defaultTaxDisplayText
  }

  search(){

    let params = {}
    if(this.state.searchQuery){params['search']=this.state.searchQuery}
    if(this.state.taxFilter){params['tax_type']=this.state.taxFilter}
    if(this.state.startDate){params['date__gte']=this.state.startDate}
    if(this.state.endDate){params['date__lte']=this.state.endDate}


    var filterUrl = "";
    for (var key in params) {
      if (filterUrl !== "") {
        filterUrl += "&";
      }
      filterUrl += key + "=" + encodeURIComponent(params[key]);
    }

    console.log(filterUrl)

    fetchObject({
      url:`${this.props.baseUrl}?${filterUrl}`,
      method:'GET',
      onSuccess: this.returnResults,
    })
  }

  returnResults(json){
    this.props.returnResults(json)
  }

  render(){
    let display
    if(this.state.showFilters){
      display = 
        <form className="container bg-light py-2">
          <label>
            Filter by Tax Type:
            <OptionListInput name={"taxFilter"} list={this.makeTaxList()} onChange={this.editTaxFilter} />
          </label>
          <br/>
          <label>
            Search by name:
            <input placeholder="Search" className="mx-2" type="search" name="searchQuery" id="searchQuery" onChange={this.handleChange} />
          </label>
          <br/>
          <label>
            From:
            <input type="date" name="startDate" onChange={this.handleChange} className="mx-2"/>
          </label>
          <label>
            Until:
            <input defaultValue={getDate.today()} type="date" name="endDate" onChange={this.handleChange} className="mx-2"/>
          </label>
          <br/>
          <button type="submit" name="search" className="btn btn-outline-primary mx-2" onClick={this.handleClick}>Apply filters</button>
          <button name="clearAll" className="btn btn-outline-danger mx-2" onClick={this.handleClick}>Clear</button>
          <button className="btn btn-outline-warning" name="hideFilters" onClick={this.handleClick}>Hide filters</button>
        </form>
    } else {
      display = <button className="btn btn-outline-warning" name="showFilters" onClick={this.handleClick}>Show filters</button>
    }

    return(
      display
    )
  }
}

export class PaginatedNav extends React.Component{
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
     
    return(
      <nav aria-label="Table navigation" className="row">
        <p className="text-light px-2">Showing result{plural} {displayedResultsString} of {this.props.tableData.count}</p>
        <ul className="pagination px-2">
          <li className={this.disablableItem(this.props.tableData.previous)}><a className="page-link" name="prev" onClick={this.handleClick}>Previous</a></li>
          <li className={this.disablableItem(this.props.tableData.next)}><a className="page-link" name="next" onClick={this.handleClick}>Next</a></li>
        </ul>
      </nav>
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
    this.changeResults=this.changeResults.bind(this)
  }

  changeResults(emissionsToDisplay, newPage=1){
    this.setState({
      displayedEmissions:emissionsToDisplay,
      page:newPage,
    })
  }

  componentDidMount(){
    this.setState({displayedEmissions:this.props.emissions})
  }

  componentDidUpdate(prevProps){
    if(this.props.emissions!==prevProps.emissions){
      this.setState({
        displayedEmissions:this.props.emissions,
        page:1
      })
    }
  }

  buildRows(){
    let emissions = this.state.displayedEmissions.results
    let tableRows=[]
    for(let i in emissions){
      tableRows.push(
        <EmissionDetail 
          emission={emissions[i]} 
          displayUnits={this.props.displayUnits} 
          profile={this.props.profile} 
          taxes={this.props.taxes} 
          fuels={this.props.fuels}
          refresh={this.props.refresh}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
      )
    }
    return tableRows
  }

  render(){

    let paginatedTableHeader
    if(this.state.displayedEmissions.length !== 0){
      paginatedTableHeader = 
        <div className="container my-2 py-2 bg-dark">
          <PaginatedNav tableData={this.state.displayedEmissions} page={this.state.page} returnPage={this.changeResults} />
          <EmissionFilterNav baseUrl="/my-emissions/" default={this.props.emissions} returnResults={this.changeResults} taxes={this.props.taxes}/>
        </div>
    }

    return(
      <div>
        {paginatedTableHeader}
        <ObjectTable tableRows={this.buildRows()} headers={["Trip Name", "Date", "Tax Type", "Distance", "Split", "CO2 Output", "Tax"]} />
      </div>
    )
  }
}

