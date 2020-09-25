import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { apiFetch } from './helperFunctions.js';
import { TaxDetail, VehicleDetail, EmissionDetail, PaymentDetail} from './objectDetail.js';
import { CreateTax, CreateVehicle } from './objectCreate.js';
import * as getDate from './getDate.js';
import * as api from './urls.js';

const PAGINATATION_RESULTS_PER_PAGE = 10 // change this with settings.py

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
      headerCols.push(<th className="text-center">{headers[i]}</th>)
    }
    return <tr>{headerCols}</tr>
  }

  render(){
    return(
      <div className="table-responsive">
        <table className="table table-light table-borderless table-sm">
          <thead className="thead-dark">
            {this.buildHeader()}
          </thead>
          <tbody className="text-center">
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
        profile={this.props.profile}
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
    if(this.props.addNew){
      tableRows.push(
        <tr>
          <button className="btn btn-outline-primary" onClick={this.createNew}>+ Create Tax</button>
        </tr>
      )
    }
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
    if(this.props.addNew){
      tableRows.push(
        <tr>
          <CreateVehicle displayUnits={this.props.displayUnits} fuels={this.props.fuels} refresh={this.props.refresh} setModal={this.props.setModal} hideModal={this.props.hideModal}/>
        </tr>
      )
    }
    
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
      this.clearFilters()
      this.props.hide()
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
    if(this.state.taxFilter){params['tax_type__name']=this.state.taxFilter}
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

    apiFetch({
      url:`${this.props.baseUrl}?${filterUrl}`,
      method:'GET',
      onSuccess: this.returnResults,
    })
  }

  returnResults(json){
    this.props.returnResults(json)
  }

  render(){
    return(
      <form className="container bg-light py-2">
        <label>
          Filter by Tax Type:
          <OptionListInput name={"taxFilter"} list={this.makeTaxList()} onChange={this.editTaxFilter} />
        </label>
        <br/>
        <label>
          Search by name:
          <input placeholder="Search" className="mx-2" type="search" name="searchQuery" id="searchQuery" onChange={this.handleChange} className="form-control m-2"/>
        </label>
        <br/>
        <label>
          From:
          <input type="date" name="startDate" onChange={this.handleChange} className="form-control mx-2"/>
        </label>
        <label>
          Until:
          <input defaultValue={getDate.today()} type="date" name="endDate" onChange={this.handleChange} className="form-control mx-2"/>
        </label>
        <br/>
        <button type="submit" name="search" className="btn btn-outline-primary m-2" onClick={this.handleClick}>Apply filters</button>
        <button name="clearAll" className="btn btn-outline-danger m-2" onClick={this.handleClick}>Clear</button>
        <button className="btn btn-outline-warning m-2" name="hideFilters" onClick={this.handleClick}>Hide filters</button>
      </form>
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
    apiFetch({
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
    let firstResult = (this.props.tableData.count===0) ? 0 : (1+(this.props.page-1)*(resultsPerPage))
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
      <nav aria-label="Table navigation" className="row p-2">
        <p className="text-light p-2 m-2">Showing result{plural} {displayedResultsString} of {this.props.tableData.count}</p>
        <ul className="pagination m-2">
          <li className={this.disablableItem(this.props.tableData.previous)}><a className="page-link" name="prev" onClick={this.handleClick}>Previous</a></li>
          <li className={this.disablableItem(this.props.tableData.next)}><a className="page-link" name="next" onClick={this.handleClick}>Next</a></li>
        </ul>
        {this.props.buttons}
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
    this.showFilters=this.showFilters.bind(this)
    this.hideFilters=this.hideFilters.bind(this)
  }

  showFilters(){
    this.setState({showFilters:true})
  }

  hideFilters(){
    this.setState({showFilters:false})
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

    let filters, showFilters
    if(this.state.showFilters){
      filters = <EmissionFilterNav baseUrl={api.MY_EMISSIONS} default={this.props.emissions} returnResults={this.changeResults} taxes={this.props.taxes} hide={this.hideFilters}/>
    } else {
      showFilters = <button className="btn btn-outline-warning m-2" onClick={this.showFilters}>Show filters</button>
    }

    let paginatedTableHeader
    if(this.state.displayedEmissions.length !== 0){
      paginatedTableHeader = 
        <div className="container p-2 bg-dark">
            <PaginatedNav tableData={this.state.displayedEmissions} page={this.state.page} returnPage={this.changeResults} buttons={showFilters}/>
            {filters}
        </div>
    }

    return(
      <div>
        {paginatedTableHeader}
        <ObjectTable tableRows={this.buildRows()} headers={["Trip Name", "Date", "Tax Type", /*"Distance", "Split", "CO2 Output",*/ "Tax"]} />
      </div>
    )
  }
}



export class PaymentFilterNav extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      searchQuery:"",
      recipientFilter:"",
      startDate:"",
      endDate:"",
    }

    this.handleChange=this.handleChange.bind(this)
    this.makeRecipientList=this.makeRecipientList.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.clearFilters=this.clearFilters.bind(this)
    this.search=this.search.bind(this)
    this.returnResults=this.returnResults.bind(this)
    this.editRecipientFilter=this.editRecipientFilter.bind(this)

    this.defaultRecipientDisplayText = "All Recipients"
  }


  makeRecipientList(){
    let recipients = this.props.recipients
    let recipientList=[this.defaultRecipientDisplayText]
    for(let i in recipients){
      recipientList.push(recipients[i].name)
    }
    return recipientList
  }

  handleChange(event){
    let property = event.target.name
    let value = event.target.value

    this.setState({
      [property]:value
    }) 
  }

  editRecipientFilter(event){
    let value = event.target.value

    if(value===this.defaultRecipientDisplayText){
      value=""
    }

    this.setState({
      recipientFilter:value
    })
  }

  handleClick(event){
    event.preventDefault()
    if(event.target.name==="search"){
      this.search()
    } else if(event.target.name==="clearAll"){
      this.clearFilters()
    } else if(event.target.name==="hideFilters"){
      this.clearFilters()
      this.props.hide()
    }
  }

  clearFilters(){
    this.props.returnResults(this.props.default)
    this.setState({
      searchQuery:"",
      recipientFilter:"",
      startDate:"",
      endDate:"",
    })
    document.getElementById("searchQuery").value = ""
    document.getElementById("recipientFilter").value = this.defaultRecipientDisplayText
  }

  search(){

    let params = {}
    if(this.state.searchQuery){params['search']=this.state.searchQuery}
    if(this.state.recipientFilter){params['recipient__name']=this.state.recipientFilter}
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

    apiFetch({
      url:`${this.props.baseUrl}?${filterUrl}`,
      method:'GET',
      onSuccess: this.returnResults,
    })
  }

  returnResults(json){
    this.props.returnResults(json)
  }

  render(){
    return(
      <form className="container bg-light py-2">
        <label>
          Filter by Recipient:
          <OptionListInput name={"recipientFilter"} list={this.makeRecipientList()} onChange={this.editRecipientFilter}/>
        </label>
        <br/>
        <label>
          Search by name:
          <input placeholder="Search" className="form-control mx-2" type="search" name="searchQuery" id="searchQuery" onChange={this.handleChange}/>
        </label>
        <br/>
        <label>
          From:
          <input type="date" name="startDate" onChange={this.handleChange} className="form-control mx-2"/>
        </label>
        <label>
          Until:
          <input defaultValue={getDate.today()} type="date" name="endDate" onChange={this.handleChange} className="form-control mx-2"/>
        </label>
        <br/>
        <button type="submit" name="search" className="btn btn-outline-primary mx-2" onClick={this.handleClick}>Apply filters</button>
        <button name="clearAll" className="btn btn-outline-danger mx-2" onClick={this.handleClick}>Clear</button>
        <button className="btn btn-outline-warning" name="hideFilters" onClick={this.handleClick}>Hide filters</button>
      </form>
    )
  }
}



export class PaymentTable extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      displayedPayments:[],
      page:1,
    }
    this.buildRows=this.buildRows.bind(this)
    this.changeResults=this.changeResults.bind(this)
    this.showFilters=this.showFilters.bind(this)
    this.hideFilters=this.hideFilters.bind(this)
  }

  showFilters(){
    this.setState({showFilters:true})
  }

  hideFilters(){
    this.setState({showFilters:false})
  }

  changeResults(paymentsToDisplay, newPage=1){
    this.setState({
      displayedPayments:paymentsToDisplay,
      page:newPage,
    })
  }

  componentDidMount(){
    this.setState({displayedPayments:this.props.payments})
  }

  componentDidUpdate(prevProps){
    if(this.props.payments!==prevProps.payments){
      this.setState({
        displayedPayments:this.props.payments,
        page:1
      })
    }
  }

  buildRows(){
    let payments = this.state.displayedPayments.results
    let tableRows=[]
    for(let i in payments){
      tableRows.push(
        <PaymentDetail 
          payment={payments[i]} 
          displayUnits={this.props.displayUnits} 
          profile={this.props.profile} 
          recipients={this.props.recipients}
          refresh={this.props.refresh}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
      )
    }
    return tableRows
  }

  render(){

    let filters, showFilters
    if(this.state.showFilters){
      filters = <PaymentFilterNav baseUrl={api.MY_PAYMENTS} default={this.props.payments} returnResults={this.changeResults} recipients={this.props.recipients} hide={this.hideFilters}/>
    } else {
      showFilters = <button className="btn btn-outline-warning m-2" onClick={this.showFilters}>Show filters</button>
    }

    let paginatedTableHeader
    if(this.state.displayedPayments.length !== 0){
      paginatedTableHeader = 
        <div className="container p-2 bg-dark">
          <PaginatedNav tableData={this.state.displayedPayments} page={this.state.page} returnPage={this.changeResults} buttons={showFilters}/>
          {filters}
        </div>
    }
    
    return(
      <div>
        {paginatedTableHeader}
        <ObjectTable tableRows={this.buildRows()} headers={["Date", "Recipient", "Amount", ""]} />
      </div>
    )
  }
}

