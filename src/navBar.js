import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
export class NavBar extends React.Component{
  constructor(props){
    super(props)

    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log(event.target.name)
  }


  render(){
    // All users
    let about = <Nav.Link name="about" onClick={this.handleClick}>About</Nav.Link>
    let contact = <Nav.Link name="contact" onClick={this.handleClick}>Contact</Nav.Link>
    let demoUser = <Nav.Link name="demoUser" onClick={this.handleClick}>Demo User</Nav.Link>

    // Authenticated users
    let dashboard = <Nav.Link name="dashboard" onClick={this.handleClick}>Dashboard</Nav.Link>
    let profile = <Nav.Link name="profile" onClick={this.handleClick}>Profile</Nav.Link>
    let newEmission = <Nav.Link name="newEmission" onClick={this.handleClick}>Add an emission</Nav.Link>
    let newPayment = <Nav.Link name="newPayment" onClick={this.handleClick}>Make a payment</Nav.Link>
    let logout = <Nav.Link name="logout" onClick={this.handleClick}>Logout</Nav.Link>

    // Unauthenticated users
    let login = <Nav.Link name="login" onClick={this.handleClick}>Login</Nav.Link>
    let signUp = <Nav.Link name="signUp" onClick={this.handleClick}>Sign up</Nav.Link>

    let navItems
    if(this.props.loggedIn){
      navItems = 
        <Nav className="mr-auto">
          {dashboard}
          {profile}
          {newEmission}
          {newPayment}
          {about}
          {contact}
          {demoUser}
          {logout}
        </Nav>  
    } else {
      navItems = 
        <Nav className="mr-auto">
          {login}
          {signUp}
          {about}
          {contact}
          {demoUser}
        </Nav>
    }

    return(
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">
          <img
            alt=""
            src="/static/finger512.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Armchair Dissident
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {navItems}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}