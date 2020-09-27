import React from 'react';
import {Badge} from 'react-bootstrap';


class ObjectDisplayView extends React.Component{

  render(){
    let icon = 
      <div className="col-2" style={{height:"2.5rem"}}>
        <img
          alt={this.props.iconAltText}
          src={this.props.iconSrc}
          height="110%"
          style={{margin: "0px 0px 0px -0.5rem"}}
        />
      </div>

    return(
      <button className="btn btn-outline-primary btn-block" onClick={this.props.onClick}>
        <div className="row" style={{height:"2.5rem"}}>
          {icon}
          <div className="col">
              <div className="row">
                <div className="col text-truncate text-left"  style={{margin: "0rem 0rem 0rem -0.25rem"}}>
                  <strong>{this.props.primaryText}</strong>
                </div>
                <div className="col-auto text-center">
                  <strong>{this.props.primaryRight}</strong>
                </div>
              </div>
              <div className="row" style={{height:"1rem"}}>
                <div className="col text-truncate text-left"  style={{margin: "-0.5rem 0rem 0rem -0.25rem"}}>
                  <small>{this.props.secondaryText}</small>
                </div>
                <div className="col-auto text-center" style={{margin: "-0.5rem 0rem 0rem 0rem"}}>
                      <small>{this.props.secondaryRight}</small>           
                </div>
              </div>
          </div>
        </div>
      </button>
    )
  }
}

export class EmissionDisplayView extends React.Component{


  render(){
    return (
      <ObjectDisplayView
        primaryText="Kamloops to Whistler return"
        secondaryText="You need to shave your beard."
        primaryRight="$12.57"
        secondaryRight="23.4kg CO2"
        iconSrc="/static/svg/001-departures.svg"
        onClick={()=>{
          console.log("HEELLLLLLLO")
        }}
      />
    )
  }
}
/*
      <button className="btn btn-outline-primary btn-block">
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col text-left">
                <strong>Squamish to Whistler</strong>
              </div>
            </div>
            <div className="row">
              <div className="col-3 mx-auto" style={{height:"2.5rem"}}>
                  <img
                    alt=""
                    src="/static/svg/001-departures.svg"
                    //width="100%"
                    height="100%"
                    //className="d-inline-block align-bottom"
                    name="home"
                    style={{margin: "0px 0px 0px 0px"}}
                  />
              </div>
              <div className="col">
                <div className="row" style={{height:"1rem"}}>
                  <div className="col" style={{margin: "-0.5rem 0px 0px 0px"}}>
                    <small className="text-right">12 Aug 2019</small>
                  </div>
                </div>
                <div className="row" style={{height:"1.5rem"}}>
                  <div className="col">
                    <h4 className="text-center">23kg</h4>
                  </div>
                  <div className="col">
                    <h4 className="text-center">$5.12</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>*/