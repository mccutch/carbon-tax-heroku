import React from 'react';


export class HomeView extends React.Component{
  
  render(){
    let display
    if(this.props.loggedIn){
      display = <button className="btn btn-info m-2" name="dashboard" onClick={this.props.selectView}>My Dashboard</button>
    }

    return(
      <div className="container-sm my-2 bg-transparent">
        <div className="row justify-content-center">
              <div className="container text-center text-light">
                <h2>Armchair Dissident Carbon Tax</h2>
                <h5>Balm for the guild-ridden traveller.</h5>
              </div>
              <button className="btn btn-info m-2" name="emissionCalculator" onClick={this.props.selectView}>+ Add a carbon emission</button>
              {display}
        </div>
      </div>
    )
  }
}