import React from 'react';
import {VerticalSpacer, NavButton} from './reactComponents.js';
import {Link} from 'react-router-dom';
import * as urls from './urls.js';

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
                  <NavButton to={urls.NAV_CALCULATOR} className="btn btn-info my-2 btn-block" textClassName="text-light">+ Add a carbon emission</NavButton>
                  {this.props.loggedIn ?
                    <div>
                      <NavButton to={urls.NAV_PAYMENT} className="btn btn-info my-2 btn-block" textClassName="text-light">+ Make a payment</NavButton>
                      <NavButton to={urls.NAV_DASHBOARD} className="btn btn-info my-2 btn-block" textClassName="text-light">My Dashboard</NavButton>  
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