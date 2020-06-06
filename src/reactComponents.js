import React from 'react';

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
    const FIXER_API_KEY = process.env.REACT_APP_FIXER_API_KEY
    let url = `http://data.fixer.io/api/symbols?access_key=${FIXER_API_KEY}`

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
    let symbols = json.symbols

    let currencyList = []
    for(let key in symbols){
      currencyList.push(
        {
          name:`${symbols[key]} (${key})`,
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
    let currencies = this.state.currencies

    return <ObjectSelectionList name="currency" onChange={this.props.onChange} list={currencies} value="symbol" label="name"/>
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