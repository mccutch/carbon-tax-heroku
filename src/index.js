import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {EmissionCalculator} from './emissionCalculator.js';
import {LoginWrapper} from './loginWrapper.js';
import {EmissionList} from './emissionList.js';
//import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';




class Page extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      loggedIn: false,
      displayUnits: units.METRIC,
      displayCalculator: true,
      displayEmissions: false,
    }

    this.setLogin=this.setLogin.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.showCalculator=this.showCalculator.bind(this)
    this.showEmissions=this.showEmissions.bind(this)
  }

  setLogin(bool_val){
    this.setState({loggedIn: bool_val})
  }

  toggleDisplayUnits(){
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }

  showCalculator(bool_val){
    this.setState({displayCalculator: bool_val})
  }

  showEmissions(bool_val){
    this.setState({displayEmissions: bool_val})
  }

  handleClick(event){
    if(event.target.name==="showCalculator"){
      this.showCalculator(true)
    } else if(event.target.name==="showEmissions"){
      this.showEmissions(true)
    }
  }
  
  render(){

    let display
    if(this.state.displayCalculator){
      display = <EmissionCalculator 
                  loggedIn={this.state.loggedIn} 
                  displayUnits={this.state.displayUnits} 
                  showCalculator={this.showCalculator}
                />
    } else if(this.state.displayEmissions){
      display = <EmissionList
                  showEmissions={this.showEmissions}
                />
    } else {
      display = 
        <div className='container my-2'>
          <button className="btn-outline-info" name="showCalculator" onClick={this.handleClick}>Add a carbon emission</button>
          <button className="btn-outline-info" name="showEmissions" onClick={this.handleClick}>View my saved records</button>
        </div>
    }

    return( 
      <div className="container-fluid bg-dark">
        <div className="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        <div>
          <LoginWrapper loggedIn={this.state.loggedIn} login={this.setLogin} toggleDisplayUnits={this.toggleDisplayUnits}/>
          {display}
        </div>
        <div className="jumbotron">
          <h1>.</h1>
        </div>
      </div>
    )
  }
  
}


ReactDOM.render(<Page />, document.getElementById('root'))