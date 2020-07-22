import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import * as units from './unitConversions.js';

export class NavBar extends React.Component{
  constructor(props){
    super(props)

    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log(event.target.name)
    this.props.onClick(event.target.name)
  }


  render(){
    let summary, sym, conversion
    let balance = "$0.00"
    if(this.props.loggedIn && this.props.stats && this.props.profile){
      summary = this.props.stats.summary
      if(summary){
        conversion = this.props.profile.conversion_factor
        sym = this.props.profile.currency_symbol
        balance = parseFloat(conversion*(summary.total_tax-summary.total_paid)).toFixed(2)
        
      }
    }


    // All users
    let about = <Nav.Link key="about" name="about" onClick={this.handleClick}>About</Nav.Link>
    let contact = <Nav.Link key="contact" name="contact" onClick={this.handleClick}>Contact</Nav.Link>
    let demoUser = <Nav.Link key="demoUser" name="demoUser" onClick={this.handleClick}>Demo User</Nav.Link>

    // Authenticated users
    let dashboard = <Nav.Link key="dashboard" name="dashboard" onClick={this.handleClick}>Dashboard</Nav.Link>
    let profile = <Nav.Link key="profile" name="profile" onClick={this.handleClick}>Profile</Nav.Link>
    let newEmission = <Nav.Link key="newEmission" name="newEmission" onClick={this.handleClick}>New Emission</Nav.Link>
    let newPayment = <Nav.Link key="newPayment" name="newPayment" onClick={this.handleClick}>New Payment</Nav.Link>
    let logout = <Nav.Link key="logout" name="logout" onClick={this.handleClick}>Logout</Nav.Link>
    let outstanding = <Nav.Link key="outstanding" name="newPayment" onClick={this.handleClick}>Balance: {sym}{balance}</Nav.Link> ///Change to payment page

    // Unauthenticated users
    let login = <Nav.Link key="login" name="login" onClick={this.handleClick}>Login</Nav.Link>
    let signUp = <Nav.Link key="signUp" name="register" onClick={this.handleClick}>Sign up</Nav.Link>
    let toggleUnits = <Nav.Link key="toggleUnits" name="toggleUnits" onClick={this.handleClick}>Change Units ({units.units(this.props.displayUnits)})</Nav.Link>

    let navLeft
    let navRight
    if(this.props.loggedIn){
      navLeft = 
        <Nav className="mr-auto">
          {dashboard}
          {newEmission}
          {newPayment} 
        </Nav>  
      navRight = 
        <Nav className="mr-auto">
          {outstanding}
          {logout}
        </Nav>
    } else {
      navLeft = 
        <Nav className="mr-auto">
          {login}
          {signUp}
          {demoUser}
          {toggleUnits}
        </Nav>
    }

    return(
      <Navbar bg="warning" variant="light" expand="md">
        <Navbar.Brand onClick={this.handleClick}>
          <img
            alt=""
            src="/static/Finger512.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            name="home"
          />{' '}
          <a name="home" > Armchair Dissident</a>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {navLeft}
          {navRight}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}