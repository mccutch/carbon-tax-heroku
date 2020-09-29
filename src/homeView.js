import React from 'react';
import {VerticalSpacer} from './reactComponents.js';

function generateByline(){
  let bylines = [
    "Balm for the guild-ridden traveller.",
    "The armchair dissident's carbon tax.",
    "Face your consumption.",
    "Liberty through taxation.",
  ]
  return bylines[Math.floor(Math.random()*bylines.length)]
}


export class HomeView extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      byline:generateByline(),
    }
  }

  render(){
    return(
      <div className="container-sm my-2">
        <div className="row justify-content-center">
              <VerticalSpacer height={1}/>
              <div className="container text-center text-dark">
                <h5>{this.state.byline}</h5>
              </div>
              <div className="row">
                <div className="col">
                  <button className="btn btn-info my-2 btn-block" name="emissionCalculator" onClick={this.props.selectView}>+ Add a carbon emission</button>
                  {this.props.loggedIn ?
                    <div>
                      <button className="btn btn-info my-2 btn-block" name="payment" onClick={this.props.selectView}>+ Make a payment</button>
                      <button className="btn btn-info my-2 btn-block" name="dashboard" onClick={this.props.selectView}>My Dashboard</button>  
                    </div>
                    :""
                }
                </div>
              </div>
        </div>
      </div>
    )
  }
}