import React from 'react';
import { LinePlot, Histogram } from './dataVisuals.js';

export class Dashboard extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      histogramData:[],
      taxHistoryCo2:[],
      taxHistoryPrice:[],
      taxList:[],
      paymentHistory:[],
      activeTab:"0",
    }

    this.buildTables=this.buildTables.bind(this)
    this.makeTab=this.makeTab.bind(this)
    this.tabChange=this.tabChange.bind(this)
  }

  componentDidMount(){
    this.buildTables()
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.buildTables()
    }
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
      taxList.push(key)
      if(key!=="total"){
        histogramDataCo2.push({tax:key, co2_kg:taxData[key].co2_kg})
        histogramDataPrice.push({tax:key, price:taxData[key].price})
      }
    }

    for(let month in emissionHistoryData){
      let dataPointCo2 = {month:month}
      let dataPointPrice = {month:month}
      for(let taxKey in emissionHistoryData[month]){
        dataPointCo2[taxKey] = emissionHistoryData[month][taxKey].co2_kg
        dataPointPrice[taxKey] = emissionHistoryData[month][taxKey].price
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

  makeTab(name, label){
    let className
    if(this.state.activeTab === name){
      className="nav-link active"
    } else {
      className="nav-link"
    }
    return <strong><a name={name} className={className} onClick={this.tabChange}>{label}</a></strong>
  }

  tabChange(event){
    this.setState({activeTab:event.target.name})
  }

  render(){

    let plot
    if(this.state.activeTab==="0"){
      plot = <LinePlot data={this.state.taxHistoryCo2} x_key="month" dataSeries={this.state.taxList} title="CO2 Output History" />
    } else if(this.state.activeTab==="1"){
      plot = <LinePlot data={this.state.taxHistoryPrice} x_key="month" dataSeries={this.state.taxList} title="Tax Cost History" />
    } else if(this.state.activeTab==="2"){
      plot = <Histogram data={this.state.histogramDataCo2} labelKey="tax" barValues={['co2_kg']} title="CO2 Proportion"/>
    } else if(this.state.activeTab==="3"){
      plot = <Histogram data={this.state.histogramDataPrice} labelKey="tax" barValues={['price']} title="Cost Proportion"/>
    } else if(this.state.activeTab==="4"){
      plot = <LinePlot data={this.state.paymentHistory} x_key="month" dataSeries={['Paid', 'Taxed']} title="Payment History" />
    }
    

    return(
      <div className="container bg-light">
        <h4>Dashboard</h4>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            {this.makeTab("0", "History - CO2")}
          </li>
          <li className="nav-item">
            {this.makeTab("1", "History - Cost")}
          </li>
          <li className="nav-item">
            {this.makeTab("2", "Total CO2")}
          </li>
          <li className="nav-item">
            {this.makeTab("3", "Total Cost")}
          </li>
          <li className="nav-item">
            {this.makeTab("4", "Payments")}
          </li>
        </ul>
        {plot}
      </div>
    )
  }
}