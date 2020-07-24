import React from 'react';
import * as units from './unitConversions.js';
import {Modal} from 'react-bootstrap';


export class StandardModal extends React.Component{
  render(){
    let modalFooter
    if(this.props.footer){
      modalFooter = 
        <Modal.Footer>
          {this.props.footer}
        </Modal.Footer>
    }

    let modalBody
    if(this.props.body){
      modalBody = 
        <Modal.Body>
          {this.props.body}
        </Modal.Body>
    }

    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header className="bg-info text-light" closeButton>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        {modalBody}
        {modalFooter}
      </Modal>
    )
  }
}

export class FormRow extends React.Component{
  render(){
    let labelClass = `col-${this.props.labelWidth} col-form-label`
    let inputClass = `col-${12-this.props.labelWidth}`
    return(
      <div className="form-group row">
        <label className={labelClass}>{this.props.label}</label>
        <div className={inputClass}>
          {this.props.input}
        </div>
      </div>
    )
  }
}


export class TabbedDisplay extends React.Component{
  /*
  this.props.tabData = [
    {
      label:<tab label 1>,
      display:<tab display 1>,
    },
    {
      label:<tab label 2>,
      display:<tab display 2>,
    },
    ...
  ]
  */

  constructor(props){
    super(props)

    this.state={
      activeTab:"0",
    }

    this.makeTab=this.makeTab.bind(this)
    this.makeTabNavBar=this.makeTabNavBar.bind(this)
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log(event.target.name)
    this.setState({
      activeTab:event.target.name
    })
  }

  makeTab(tabIndex, label){
    let className
    if(this.state.activeTab === tabIndex){
      className="nav-link active"
    } else {
      className="nav-link"
    }
    return <strong><a name={tabIndex} className={className} onClick={this.handleClick}>{label}</a></strong>
  }

  makeTabNavBar(){
    let tabData = this.props.tabData
    let navBar = []
    for(let i in tabData){
      navBar.push(<li className="nav-item">{this.makeTab(i.toString(), tabData[i].label)}</li>)
    }
    return navBar
  }

  render(){
    let activeTab = parseInt(this.state.activeTab)
    let display = this.props.tabData[activeTab].display

    let style = "nav "+this.props.style

    return(
      <div className="container py-2">
        <ul className={style}>
          {this.makeTabNavBar()}
        </ul>
        {display}
      </div>
    )
  }
}

export class DisplayUnitSelection extends React.Component{
  render(){
    return(
      <ObjectSelectionList name={this.props.name} list={units.allUnits} defaultValue={this.props.defaultValue} value="str" label="label" onChange={this.props.onChange}/>
    )
  }
}

export class CurrencySymbolSelection extends React.Component{

  render(){
    let list = [
      {symbol: "$"},
      {symbol: "€"},
      {symbol: "¥"},
      {symbol: "£"},
    ]

    return(
      <ObjectSelectionList name={this.props.name} list={list} value="symbol" label="symbol" onChange={this.props.onChange} defaultValue={this.props.defaultValue}/>
    )
  }
}

export class CurrencySelection extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      currencies:[]
    }
    this.fetchCurrencies = this.fetchCurrencies.bind(this)
    this.receiveCurrencies = this.receiveCurrencies.bind(this)
  }

  componentDidMount(){
    this.fetchCurrencies()
  }

  fetchCurrencies(){
    const CURRENCY_API = process.env.REACT_APP_CURRENCY_API
    let url = `https://free.currconv.com/api/v7/currencies?apiKey=${CURRENCY_API}`
    console.log(`CurrencyURL: ${url}`)

    fetch(url)
    .then(res => {
      //console.log(res)
      return res.json()
    })
    .then(json => {
      //console.log(json)
      this.receiveCurrencies(json)
    })
    .catch(error => {
      console.log(error)
    });
  }

  receiveCurrencies(json){
    let symbols = json.results
    //console.log(symbols)
    let currencyList = []
    for(let key in symbols){
      //console.log(key)
      currencyList.push(
        {
          name:`${symbols[key]['currencyName']} (${key})`,
          //name:key,
          symbol:key
        }
      )
    }
    //console.log(currencyList)
    this.setState({
      currencies:currencyList
    })
  }

  render(){
    //console.log("Render currency list")
    let currencies = this.state.currencies

    let display
    if(currencies.length>0){
      display = <ObjectSelectionList name={this.props.name} onChange={this.props.onChange} list={currencies} value="symbol" label="name" defaultValue={this.props.defaultValue}/>
    } else {
      display = <select></select>
    }

    return display
  }
}

export class ObjectSelectionList extends React.Component{
  render(){
      let list = this.props.list;
      let listOptions = [];
      for(let i=0; i<list.length; i++){
        let key = (this.props.keyValue ? list[i][this.props.keyValue] : i)

        listOptions.push(
          <option 
            value={list[i][this.props.value]}
            key = {key}
          >
            {list[i][this.props.label]}
          </option>
        )
      }
      return (
        <select
          id = {this.props.name}
          name = {this.props.name}
          onChange = {this.props.onChange}
          defaultValue = {this.props.defaultValue}
          className="form-control m-2"
        >
          {listOptions}
        </select>
      )
  }
}