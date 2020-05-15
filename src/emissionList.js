import React from 'react';

export class EmissionList extends React.Component{
  constructor(props){
    super(props)

    this.exitList=this.exitList.bind(this)
  }

  exitList(){
    this.props.showEmissions(false)
  }


  render(){

    return(
      <div className="container bg-info my-2">
        <div className="my-2 row">
          <h3>My saved emissions  </h3>
          <button type="button" className="btn-outline-danger" onClick={this.exitList}>Exit</button>
        </div>
      </div>
    )
  }
}