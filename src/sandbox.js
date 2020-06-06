import React from 'react';

import {fetchObject} from './helperFunctions.js';

import {CurrencySelection, ObjectSelectionList} from './reactComponents.js';

import * as units from './unitConversions.js';

export class Sandbox extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }
    
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event){
    console.log(event.target.value)
    this.setState({[event.target.name]:event.target.value})
  }

  

  

  render(){

    return(
      <div className="container bg-light">
        <h1>Sandbox</h1>
        <CurrencySelection />
        <ObjectSelectionList list={units.allUnits} value="str" label="label" />
      </div>
    )
  }
}