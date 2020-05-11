import React from 'react';

export class Sandbox extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      date:null,
    }
    
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event){
    console.log(event.target.value)
    this.setState({date:event.target.value})
  }

  render(){

    let date
    if(this.state.date){
      date = <p>{this.state.date}</p>
    }

    let today = new Date()

    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    let todayString = `${yyyy}-${mm}-${dd}`




    return(
      <div className="container bg-light">
        <h1>Sandbox</h1>
        <input type="date" name="date" onChange={this.handleChange}/>
        {date}
        <p>{todayString}</p>
      </div>
    )
  }
}