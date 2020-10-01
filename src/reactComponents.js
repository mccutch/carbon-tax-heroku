import React from 'react';
import * as units from './unitConversions.js';
import {Modal} from 'react-bootstrap';
import {sortByKey} from './helperFunctions.js';
import {Link} from 'react-router-dom';


export class PendingBtn extends React.Component{
  render(){
    return <button name={this.props.name} onClick={this.props.onClick} className={`btn ${this.props.className} ${this.props.pending?"disabled":""}`} >{this.props.children}</button>
  }
}

export class CenterPage extends React.Component{
  render(){
    return <div className='container-sm my-2 bg-light' style={{maxWidth:"600px"}}>{this.props.children}</div>
  }
}

export class CleanLink extends React.Component{
  render(){
    return <Link to={this.props.to} className={this.props.className} style={{textDecoration:'none'}}>{this.props.children}</Link>
  }
}

export class NavButton extends React.Component{
  render(){
    return(
      
        <CleanLink to={this.props.to} >
          <button className={this.props.className}>
          {this.props.children}
          </button>
        </CleanLink>
      
    )
  }
}

export class VerticalSpacer extends React.Component{
  render(){
    return(
      <div>
        <div className="col" style={{height:`${this.props.height?this.props.height:3}rem`}}>
        </div>
      </div>
    )
  }      
}

export class LabelledInput extends React.Component{
  render(){
    return(
      <div className={this.props.className}>
      <div className="input-group">
        {this.props.prepend ?
          <div className="input-group-prepend">
            <span className="input-group-text"> {this.props.prepend} </span>
          </div>
          : ""
        }
        {this.props.input}
        {this.props.append ?
          <div className="input-group-append">
            <span className="input-group-text"> {this.props.append} </span>
          </div>
          : ""
        }
      </div>
      </div>
    )
  }
}

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
        <Modal.Header className="bg-teal text-light" closeButton>
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
      <div className="form-group form-row">
        <div className={labelClass}>{this.props.label}</div>
        <div className={inputClass}>
          {this.props.input}
        </div>
        {this.props.helpText ? <small className="form-text text-muted mx-2">{this.props.helpText}</small> : ""}
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
    console.log(tabIndex)
    console.log(label)
    return(
      <strong><a name={tabIndex} className={`nav-link ${this.state.activeTab===tabIndex?"active bg-light border-dark":""}`} onClick={this.handleClick}>
        {label}
      </a></strong>
    )
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


    return(
      <div>
        <ul className="nav nav-tabs border-dark" style={{margin:"0.5rem 0rem 0rem 0rem"}}>
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
    let list = [ {symbol: "$"}, {symbol: "€"}, {symbol: "¥"}, {symbol: "£"},]
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
    let currencyList = []
    for(let key in symbols){
      currencyList.push(
        {
          name:`${symbols[key]['currencyName']} (${key})`,
          symbol:key
        }
      )
    }
    currencyList=sortByKey({list:currencyList, key:"name"})
    this.setState({
      currencies:currencyList
    })
  }

  render(){
    let currencies = this.state.currencies
    return ((currencies.length>0) ?
      <ObjectSelectionList name={this.props.name} onChange={this.props.onChange} list={currencies} value="symbol" label="name" defaultValue={this.props.defaultValue}/>
      :
      <select></select>
    )
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
          className="form-control my-2"
        >
          {listOptions}
        </select>
      )
  }
}