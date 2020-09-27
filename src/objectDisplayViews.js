import React from 'react';


export class ObjectDisplayView extends React.Component{



  render(){

    return(
      <button className="btn btn-outline-primary btn-block">
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-7 text-left bg-info">
                <strong>Squamish to Whistler</strong>
              </div>
              <div className="col text-right text-uppercase bg-danger">
                <small>12 aug 2019</small>
                <small>12 aug 2019</small>
              </div>
            </div>
            <div className="row">
              <div className="col-3 bg-primary">
                <img
                  alt=""
                  src="/static/finger192.png"
                  width="100%"
                  className="d-inline-block align-top"
                  name="home"
                />
              </div>
              <div className="col bg-danger">
                <div className="row align-middle">
                <h5 className="text-left">23kg CO2</h5>
                </div>
              </div>
              <div className="col bg-warning">
                <h3>$5.12</h3>
              </div>
            </div>
          </div>
        </div>
      </button>
    )
  }
}