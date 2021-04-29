import React from 'react';
import {Nav} from 'react-bootstrap';
import {NavLink, Link} from 'react-router-dom';
import * as units from './unitConversions.js';
import {displayCurrency} from './helperFunctions.js';
import * as urls from './urls.js';
import {CleanLink} from './reactComponents.js';
import * as loginFunctions from './loginWrapper.js'; //{LoginForm, logoutBrowser, demoLogin}

import {RegistrationForm} from './registrationForm.js';

export class TabbedNavBar extends React.Component{

  makeTab(name, label){
    return  <a name={name} className={`nav-link ${this.props.activeTab===name?"active bg-light border-dark":""}`} onClick={this.props.onTabClick}>
              <strong>{label}</strong>
            </a>
  }

  buildNavTabs(){
    let tabs = this.props.tabs
    let navTabs = []
    for(let i in tabs){
      navTabs.push(
        <li className="nav-item">
          {this.makeTab(tabs[i].name, tabs[i].label)}
        </li>
      )
    }
    return navTabs
  }

  render(){
    return(
      <ul className="nav nav-tabs border-dark my-2">
        {this.buildNavTabs()}
      </ul>
    )
  }
}

export class BootstrapNavBar extends React.Component{
  constructor(props){
    super(props)
    this.state={collapsed:true}
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    this.setState({collapsed:true})
    console.log(event.target.name)
    this.props.onClick(event.target.name)
  }

  render(){
    let summary, sym, conversion
    let balance = "$0.00"
    if(this.props.app.loggedIn && this.props.userData.stats && this.props.userData.profile){
      summary = this.props.userData.stats.summary
      if(summary){
        balance = displayCurrency(summary.balance, this.props.userData.profile)
      }
    }


    // All users
    //let about = <NavLink to="/about" activeClassName="active">About</NavLink>/*<Nav.Link key="about" name="about" onClick={this.handleClick}>About</Nav.Link>*/
    let contact = <Nav.Link>
                    <CleanLink to={urls.NAV_CONTACT} className="text-light" activeClassName="active" onClick={this.handleClick}>Contact</CleanLink>
                  </Nav.Link>

    let demoUser =  <Nav.Link key="demoUser" name="demoUser" className="text-light" 
                      onClick={(event)=>{
                        this.handleClick(event)
                        loginFunctions.demoLogin({onSuccess:this.props.app.refresh, onFailure:this.props.app.serverError})
                      }}
                    >Demo User</Nav.Link>

    // Authenticated users
    let dashboard = <Nav.Link>
                      <CleanLink to={urls.NAV_DASHBOARD} className="text-light" activeClassName="active" onClick={this.handleClick}>Dashboard</CleanLink>
                    </Nav.Link>
    //let profile = <Nav.Link key="profile" name="profile" onClick={this.handleClick}>Profile</Nav.Link>
    let newEmission = <Nav.Link>
                        <CleanLink to={urls.NAV_CALCULATOR} className="text-light" activeClassName="active" onClick={this.handleClick}>New Emission</CleanLink>
                      </Nav.Link>

    let newPayment =  <Nav.Link>
                        <CleanLink to={urls.NAV_PAYMENT} className="text-light" activeClassName="active" onClick={this.handleClick}>New Payment</CleanLink>
                      </Nav.Link>

    let logout = <Nav.Link key="logout" name="logout"  className="text-light" onClick={this.handleClick}>Logout</Nav.Link>

    let outstanding = <Nav.Link>
                        <CleanLink to={urls.NAV_PAYMENT} className="text-light" activeClassName="active"  onClick={this.handleClick}>Balance: {balance}</CleanLink>
                      </Nav.Link> ///Change to payment pag

    // Unauthenticated users
    let login = <Nav.Link key="login" name="login" className="text-light" onClick={this.handleClick}>Login</Nav.Link>
    let signUp = <Nav.Link key="signUp" name="register" className="text-light" 
                  onClick={(event)=>{
                    this.handleClick(event)
                    this.props.app.setModal(<RegistrationForm onSuccess={this.props.app.refresh} app={this.props.app}/>)
                  }}
                >Sign up</Nav.Link>
    let toggleUnits = <Nav.Link key="toggleUnits" name="toggleUnits" className="text-light" onClick={this.handleClick}>Units ({units.units(this.props.app.displayUnits)})</Nav.Link>

    let navLeft
    let navRight
    if(this.props.app.loggedIn){
      navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {newEmission}
          {newPayment} 
          {dashboard}
          {contact}
        </ul>  
      navRight = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {outstanding}
          {logout}
        </ul>
    } else {
      navLeft = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {newEmission}
          {login}
          {signUp}
          {demoUser}
          {contact}
          {toggleUnits}
        </ul>
    }

    let navColour = (this.props.app.serverError ? "secondary":"banner")

    return(
      <nav className={`navbar navbar-expand-lg navbar-dark bg-${navColour}`}>
        <a className="navbar-brand">
          <img
            alt=""
            src={urls.NAVBAR_ICON}
            width="40"
            //height="50"
            //className="d-inline-block align-middle"
          />{' '}
          <CleanLink className="text-light" to="/"> Carbon Accountant</CleanLink>
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          dataToggle="collapse" 
          dataTarget="#navbarTogglerDemo02" 
          ariaControls="navbarTogglerDemo02" 
          ariaExpanded="false" 
          ariaLabel="Toggle navigation"
          onClick={()=>{this.setState({collapsed:!this.state.collapsed})}}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${this.state.collapsed?'collapse':""}`} id="navbarTogglerDemo02">
          {navLeft}
          {navRight}
        </div>
      </nav>
    )
  }
}