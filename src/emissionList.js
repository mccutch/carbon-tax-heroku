import React from 'react';
import { EmissionTable } from './userTables.js';



export class EmissionListWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      displayEmissions: {},
    }

    this.exitList=this.exitList.bind(this)
  }

  exitList(){
    this.props.exit()
  }


  render(){
    let emissionTable = 
        <div>
          <EmissionTable 
            emissions={this.props.emissions} 
            displayUnits={this.props.displayUnits}
            taxes={this.props.taxes}
            profile={this.props.profile}
            refresh={this.props.refresh}
          />
        </div>


    return(
      <div className="container bg-info my-2">
        <div className="my-2 row">
          <h3 className="px-2">My saved emissions</h3>
          <button type="button" className="btn btn-outline-danger px-2" onClick={this.exitList}>Exit</button>
        </div>
        {emissionTable}
      </div>
    )
  }
}