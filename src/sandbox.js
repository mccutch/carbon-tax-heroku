import React from 'react';

import {fetchObject, convertCurrency} from './helperFunctions.js';

import {CurrencySelection, ObjectSelectionList} from './reactComponents.js';

import * as units from './unitConversions.js';

export class Sandbox extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }
    
    this.handleChange = this.handleChange.bind(this)
    this.convert=this.convert.bind(this)
    this.receive=this.receive.bind(this)
  }

  handleChange(event){
    console.log(event.target.value)
    this.setState({[event.target.name]:event.target.value})
  }

  convert(event){
    convertCurrency({
      amount:event.target.value,
      convertFrom:"AUD",
      convertTo:"USD",
      onSuccess:this.receive,
    })
  }

  receive(amount){
    this.setState({
      convertedNum:amount
    })
  }
  

  

  render(){

    return(
      <div className="container bg-light">
        <h1>Sandbox</h1>
      </div>
    )
  }
}