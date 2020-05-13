import React from 'react';


export class VehicleSaveForm extends React.Component{
  constructor(props){
    super(props)
    this.handleClick=this.handleClick.bind(this)
    this.handleChange=this.handleChange.bind(this)
  }

  handleClick(){
    this.props.saveAs(this.props.vehicleName)
  }

  handleChange(event){
    this.props.saveAs(event.target.value)
  }

  render(){

    let display
    if(this.props.vehicleWillSave){
      //Will be saved as...
      
      display = 
        <div>
          <h3>Save as</h3>
          <input name="vehicleSaveAs" type="text" defaultValue={this.props.vehicleName}  onChange={this.handleChange}/>
        </div>

    }else {
      //save this ?
      display = 
        <div className="row">
          <button
            type="button"
            name="saveVehicle"
            className="btn-outline-warning"
            onClick={this.handleClick}
          >Save this vehicle?</button>
        </div>
    }

    return(
      <div>
        {display}
      </div>
    )
  }
}
