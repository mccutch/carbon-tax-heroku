import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {EmissionCalculator} from './emissionCalculator.js';
import {LoginWrapper} from './loginWrapper.js';
import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';




class Page extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      loggedIn: false,
      displayUnits: units.METRIC,
    }

    this.setLogin=this.setLogin.bind(this)
    this.toggleDisplayUnits = this.toggleDisplayUnits.bind(this);
  }

  setLogin(bool_val){
    this.setState({loggedIn: bool_val})
  }

  toggleDisplayUnits(){
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }
  
  render(){

    return( 
      <div className="container-fluid bg-dark">
        <div className="jumbotron">
          <h1>Armchair Dissident Carbon Tax</h1>      
          <p>Everything's fucked anyway.</p>
        </div>
        <div>
          <LoginWrapper loggedIn={this.state.loggedIn} login={this.setLogin} toggleDisplayUnits={this.props.toggleDisplayUnits}/>
          <EmissionCalculator loggedIn={this.state.loggedIn} displayUnits={this.state.displayUnits}/>
          <Sandbox />
        </div>
        <div className="jumbotron">
          <h1>.</h1>
        </div>
      </div>
    )
  }
  
}


ReactDOM.render(<Page />, document.getElementById('root'))