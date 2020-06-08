import React from 'react';
import * as units from './unitConversions.js';


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
    console.log("Render currency list")
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
        >
          {listOptions}
        </select>
      )
  }
}