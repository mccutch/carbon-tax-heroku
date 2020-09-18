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
      radio:"co2",
    }

    this.buildTables=this.buildTables.bind(this)
    this.getTaxName=this.getTaxName.bind(this)
    this.handleDisplayChange=this.handleDisplayChange.bind(this)
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

  handleDisplayChange(event){
    this.setState({radio:event.target.value})
  }

  render(){
    let paymentHistory = 
      <LinePlot 
        data={this.state.paymentHistory} 
        x_key="month" 
        dataSeries={['Paid', 'Taxed']} 
        title="Payment History"
        preUnit={this.props.profile.currency_symbol}
        postUnit=""
        yLabel={`Cost (${this.props.profile.currency_symbol})`} 
      />

    let active = "btn btn-primary btn-sm active"
    let inactive = "btn btn-primary btn-sm"

    let radioSwitches = 
      //<div className="custom-radio">
      <div className="btn-group btn-group-toggle m-2" /*data-toggle="buttons"*/>
        <label class={this.state.radio==="co2" ? active : inactive}>
          CO2
          <input type="radio" value="co2" checked={this.state.radio==="co2"} onChange={this.handleDisplayChange} />
        </label>
        <br/>
        <label class={this.state.radio==="co2" ? inactive : active}>
          Price
          <input type="radio" value="price" checked={this.state.radio==="price"} onChange={this.handleDisplayChange} />
        </label>
      </div>

    let history = 
      <div>
        <LinePlot 
          data={this.state.radio==="co2" ? this.state.taxHistoryCo2 : this.state.taxHistoryPrice} 
          x_key="month" 
          dataSeries={this.state.taxList} 
          title={`Emission History - ${this.state.radio==="co2" ? "Carbon Output" : "Cost"}`}
          //xLabel="Date"
          yLabel={this.state.radio==="co2" ? "kg CO2" : `Cost (${this.props.profile.currency_symbol})`}
          switches = {radioSwitches}
          postUnit={this.state.radio==="co2" ? "kg" : ""}
          preUnit={this.state.radio==="co2" ? "" : this.props.profile.currency_symbol}
        />
      </div>

    let totals = 
      <div>
        <Histogram 
          data={this.state.radio==="co2" ? this.state.histogramDataCo2 : this.state.histogramDataPrice}
          labelKey="tax" 
          barValues={[this.state.radio==="co2" ? 'co2_kg' : 'price']} 
          title={`Total ${this.state.radio==="co2" ? "Carbon Output" : "Cost"}`}
          xLabel={this.state.radio==="co2" ? "kg CO2" : `Cost (${this.props.profile.currency_symbol})`}
        />
        {radioSwitches}
      </div>
    
    let tabData = [
      {
        label: "History",
        display: history,
      },
      {
        label: "Total",
        display: totals,
      },
      {
        label: "Payments",
        display: paymentHistory,
      },
    ]
    return <TabbedDisplay style="nav-tabs" tabData={tabData} />
  }
}



export class Dashboard extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      display:(this.props.emissions.count==0 && this.props.payments.count==0) ? "profile":"history",
    }

    this.changeDisplay=this.changeDisplay.bind(this)
    this.buildTabs=this.buildTabs.bind(this)
  }

  changeDisplay(event){this.setState({display:event.target.name})}

  buildTabs(){
    if(this.props.emissions.count==0 && this.props.payments.count==0){
      return <Nav.Link key="profile" name="profile" onClick={this.changeDisplay}>Profile</Nav.Link>
    } else{
      return( 
        <div className="row">
          <Nav.Link key="history" name="history" onClick={this.changeDisplay}>History</Nav.Link>
          <Nav.Link key="stats" name="stats" onClick={this.changeDisplay}>Stats</Nav.Link>
          <Nav.Link key="profile" name="profile" onClick={this.changeDisplay}>Profile</Nav.Link>
        </div>
      )
    }
  }

  render(){
    let display
    if(this.state.display==="stats"){
      display = <StatsDisplay stats={this.props.stats} taxes={this.props.taxes} profile={this.props.profile}/>
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
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
        />
    } else if(this.state.display==="history"){
      display = 
        <HistoryLists 
          refresh={this.props.refresh}
          taxes={this.props.taxes}
          displayUnits={this.props.displayUnits}
          emissions={this.props.emissions}
          profile={this.props.profile}
          recipients={this.props.recipients}
          payments={this.props.payments}
          setModal={this.props.setModal}
          hideModal={this.props.hideModal}
          fuels={this.props.fuels}
        />
    }
      
    return(
      // Add -15px margin to sides of navbar to make full-width
      //<div className="my-2 bg-light">
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
          <Navbar bg="info" variant="dark">
            <Navbar.Brand >
              {this.props.user.username}
            </Navbar.Brand>
            <Nav className="mr-auto">
              {this.buildTabs()}
            </Nav>
          </Navbar>
        </div>
        {display}
      </div>
    )
  }
}