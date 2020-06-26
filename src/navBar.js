import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
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

    // Unauthenticated users
    let login = <Nav.Link key="login" name="login" onClick={this.handleClick}>Login</Nav.Link>
    let signUp = <Nav.Link key="signUp" name="register" onClick={this.handleClick}>Sign up</Nav.Link>

    let navItems
    if(this.props.loggedIn){
      navItems = 
        <Nav className="mr-auto">
          {dashboard}
          {newEmission}
          {newPayment}
          {logout}
        </Nav>  
    } else {
      navItems = 
        <Nav className="mr-auto">
          {login}
          {signUp}
          {demoUser}
        </Nav>
    }

    return(
      <Navbar bg="warning" variant="light" expand="md">
        <Navbar.Brand onClick={this.handleClick}>
          <img
            alt=""
            src="/static/finger512.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            name="home"
          />{' '}
          <a name="home" > Armchair Dissident</a>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {navItems}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}