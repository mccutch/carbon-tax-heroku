import React from 'react';

import {fetchObject, convertCurrency, truncate, fetchFromCache } from './helperFunctions.js';

import {CurrencySelection, ObjectSelectionList} from './reactComponents.js';
import {EmissionDisplayView} from './objectDisplayViews.js';

import * as units from './unitConversions.js';

export class Sandbox extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }
    
    this.handleChange = this.handleChange.bind(this)
    this.convert=this.convert.bind(this)
    this.receive=this.receive.bind(this)
    this.truncateString=this.truncateString.bind(this)
  }

  handleChange(event){
    //console.log(event.target.value)
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
  
  truncateString(event){
    console.log(truncate(event.target.value, 4))
  }
  

  render(){

    return(
      <div className="container bg-dark text-light">
        <h1>Sandbox</h1>
        <div className="container bg-light text-dark py-2">
          <EmissionDisplayView />
        </div>
      </div>
    )
  }
}