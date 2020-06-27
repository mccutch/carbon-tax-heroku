import React from 'react';
import { LinePlot, Histogram } from './dataVisuals.js';
import { UserObjectLists } from './userProfile.js';
import { TabbedDisplay } from './reactComponents.js';
import { ProfileDisplay, HistoryLists } from './userProfile.js';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

export class StatsDisplay extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      histogramData:[],
      taxHistoryCo2:[],
      taxHistoryPrice:[],
      taxList:[],
      paymentHistory:[],
    }

    this.buildTables=this.buildTables.bind(this)
    this.getTaxName=this.getTaxName.bind(this)
  }

  componentDidMount(){
    this.buildTables()
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.buildTables()
    }
  }

  getTaxName(taxId){
    if(taxId==="total" || taxId==="Total"){
      return "Total"
    }

    let taxName
    for(let i in this.props.taxes){
      if(this.props.taxes[i].id===parseInt(taxId)){
        taxName=this.props.taxes[i].name
        return taxName
      }
    }
    return `Tax ID:${taxId}`
  }

  buildTables(){
    let histogramDataCo2 = []
    let histogramDataPrice = []
    let historyDataCo2 = []
    let historyDataPrice = []
    let taxList = []
    let paymentHistory = []

    let taxData = this.props.stats.emissions_by_tax
    let emissionHistoryData = this.props.stats.emissions_by_month_and_tax
    let paymentHistoryData = this.props.stats.payments_by_month
    
    //let totalCo2 = taxData.total.co2_kg
    //let totalCost = taxData.total.price

    for(let key in taxData){
      taxList.push(this.getTaxName(key))
      if(key!=="total"){
        histogramDataCo2.push({tax:this.getTaxName(key), co2_kg:taxData[key].co2_kg})
        histogramDataPrice.push({tax:this.getTaxName(key), price:taxData[key].price})
      }
    }

    for(let month in emissionHistoryData){
      let dataPointCo2 = {month:month}
      let dataPointPrice = {month:month}
      for(let taxKey in emissionHistoryData[month]){
        dataPointCo2[this.getTaxName(taxKey)] = emissionHistoryData[month][taxKey].co2_kg
        dataPointPrice[this.getTaxName(taxKey)] = emissionHistoryData[month][taxKey].price
      }
      historyDataCo2.push(dataPointCo2)
      historyDataPrice.push(dataPointPrice)
    }

    for(let month in paymentHistoryData){
      paymentHistory.push({month:month, Paid:paymentHistoryData[month]['paid'], Taxed:paymentHistoryData[month]['tax']})
    }

    // Sort histogram data
    histogramDataCo2.sort(function(b, a) { 
      return a.co2_kg - b.co2_kg;
    })
    histogramDataPrice.sort(function(b, a) { 
      return a.price - b.price;
    })


    this.setState({
      histogramDataCo2:histogramDataCo2,
      histogramDataPrice:histogramDataPrice,
      taxHistoryCo2:historyDataCo2,
      taxHistoryPrice:historyDataPrice,
      taxList:taxList,
      paymentHistory:paymentHistory,
    })
  }

  render(){

    let co2History = <LinePlot data={this.state.taxHistoryCo2} x_key="month" dataSeries={this.state.taxList} title="CO2 Output History" />
    let costHistory = <LinePlot data={this.state.taxHistoryPrice} x_key="month" dataSeries={this.state.taxList} title="Tax Cost History" />
    let co2Total = <Histogram data={this.state.histogramDataCo2} labelKey="tax" barValues={['co2_kg']} title="Total CO2"/>
    let costTotal = <Histogram data={this.state.histogramDataPrice} labelKey="tax" barValues={['price']} title="Total Costs"/>
    let paymentHistory = <LinePlot data={this.state.paymentHistory} x_key="month" dataSeries={['Paid', 'Taxed']} title="Payment History" />
    
    let tabData = [
      {
        label: "History - CO2",
        display: co2History,
      },
      {
        label: "History - Cost",
        display: costHistory,
      },
      {
        label: "Total CO2",
        display: co2Total,
      },
      {
        label: "Total Costs",
        display: costTotal,
      },
      {
        label: "Payments",
        display: paymentHistory,
      }
    ]
    return <TabbedDisplay style="nav-tabs" tabData={tabData} />
  }
}



export class Dashboard extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      display:"stats",
    }

    this.changeDisplay=this.changeDisplay.bind(this)
  }

  changeDisplay(event){
    this.setState({display:event.target.name})
  }

  render(){
    let display
    if(this.state.display==="stats"){
      display = <StatsDisplay stats={this.props.stats} taxes={this.props.taxes}/>
    } else if(this.state.display==="profile"){
      display = 
        <ProfileDisplay
          user={this.props.user}
          profile={this.props.profile}
          taxes={this.props.taxes}
          vehicles={this.props.vehicles}
          fuels={this.props.fuels}
          displayUnits={this.props.displayUnits}
          emissions={this.props.emissions}
          refresh={this.props.refresh}
          logout={this.props.logout}
        />
    } else if(this.state.display==="history"){
      display = 
        <HistoryLists 
          refresh={this.props.refresh}
          taxes={this.props.taxes}
          displayUnits={this.props.displayUnits}
          emissions={this.props.emissions}
          profile={this.props.profile}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
    }
      
    return(
      // Add -15px margin to sides of navbar to make full-width
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="primary" variant="dark">
          <Navbar.Brand >
            {this.props.user.username}
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link key="stats" name="stats" onClick={this.changeDisplay}>Stats</Nav.Link>
            <Nav.Link key="history" name="history" onClick={this.changeDisplay}>History</Nav.Link>
            <Nav.Link key="profile" name="profile" onClick={this.changeDisplay}>Profile</Nav.Link>
          </Nav>
        </Navbar>
        </div>
        {display}
      </div>
    )
  }
}