import React from 'react';

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
    let dashboard, payment
    if(this.props.loggedIn){
      dashboard = <button className="btn btn-info m-2" name="dashboard" onClick={this.props.selectView}>My Dashboard</button>
      payment = <button className="btn btn-info m-2" name="payment" onClick={this.props.selectView}>+ Make a payment</button>
    }

    return(
      <div className="container-sm my-2">
        <div className="row justify-content-center">
              <div className="container text-center text-dark">
                <h2>Carbon Accountant</h2>
                <h5>{this.state.byline}</h5>
              </div>
              <button className="btn btn-info m-2" name="emissionCalculator" onClick={this.props.selectView}>+ Add a carbon emission</button>
              {payment}
              {dashboard}
        </div>
      </div>
    )
  }
}