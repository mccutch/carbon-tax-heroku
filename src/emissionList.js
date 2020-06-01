import React from 'react';
import{refreshToken} from './myJWT.js';
import * as units from './unitConversions';
import { EmissionTable } from './userTables.js';



export class EmissionListWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      displayEmissions: false,
    }

    this.exitList=this.exitList.bind(this)
  }

  exitList(){
    this.props.showEmissions(false)
  }


  render(){
    let emissionTable = 
        <div>
          <EmissionTable 
            emissions={this.props.emissions} 
            displayUnits={this.props.displayUnits}
          />
        </div>


    return(
      <div className="container bg-info my-2">
        <div className="my-2 row">
          <h3>My saved emissions</h3>
          <button type="button" className="btn-outline-danger" onClick={this.exitList}>Exit</button>
        </div>
        {emissionTable}
      </div>
    )
  }
}