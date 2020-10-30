import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
//import 'bootstrap/dist/css/bootstrap.min.css';

import {LoginWrapper} from './loginWrapper.js';
import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';
import {refreshToken}  from './myJWT.js';
import {apiFetch, testServer} from './helperFunctions.js';
import {MainView} from './mainView.js';
import {NavBar, BootstrapNavBar} from './navBar.js';
import {LoginForm, logoutBrowser, demoLogin} from './loginWrapper.js';
import {RegistrationForm} from './registrationForm.js';
import * as serviceWorker from './serviceWorker.js';
import {GoogleDirections} from './googleDirections.js';
import {USER_CACHE} from './constants.js';
import * as api from './urls.js';
import {VerticalSpacer, CenterPage} from './reactComponents.js';
import {EmissionCalculator} from './emissionCalculator.js';
import {EmissionListWrapper} from './emissionList.js';
import {Dashboard} from './dashboard.js';
import {ProfileDisplay} from './userProfile.js';
import {HomeView} from './homeView.js';
import {PaymentView} from './payment.js';
import {ContactPage} from './contact.js';

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";


class App extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      loggedIn: false,
      displayUnits: units.METRIC,
      user: {},
      profile: {},
      taxes: [],
      vehicles: [],
      fuels:[],
      emissions:[],
      stats:{},
      recipients:[],
      modal:null,
      mainView:"home",
      serverConnectionFailure:false,
    }

    this.defaultState = JSON.parse(JSON.stringify(this.state))

    this.login=this.login.bind(this)
    this.logout=this.logout.bind(this)
    this.logoutSuccess=this.logoutSuccess.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    
    this.fetchUserObject = this.fetchUserObject.bind(this)
    this.refreshFullProfile = this.refreshFullProfile.bind(this)
    this.setFuels = this.setFuels.bind(this)
    this.serverConnectionFailure = this.serverConnectionFailure.bind(this)
    this.useProfileSettings = this.useProfileSettings.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.handleNavClick = this.handleNavClick.bind(this)
    this.setModal = this.setModal.bind(this)
    this.setMainView = this.setMainView.bind(this)
    this.setModalContent = this.setModalContent.bind(this)
    this.useState = this.useState.bind(this)
    this.testServer = this.testServer.bind(this)
  }

  componentDidMount(){
    apiFetch({
      url:api.FUEL_TYPES, 
      onSuccess:this.setFuels,
      onFailure:this.serverConnectionFailure,
      noAuth:true,
    })
    this.fetchUserObject({url:api.GET_USER, objectName:"user", onSuccess:this.login})
  }

  componentDidUpdate(prevProps){
    if(this.state.serverConnectionFailure) this.testServer();
  }

  serverConnectionFailure(){
    console.log("Server connection failure")
    this.setState({serverConnectionFailure:true})
  }

  testServer(){
    console.log("Testing server connection")
    testServer({
      onSuccess:()=>{
        this.setState({serverConnectionFailure:false}, this.refreshFullProfile)
      },
      onFailure:()=>{
        console.log("Server connection test failed.")
      }
    })
  }

  setFuels(json){
    // fueltypes returns as a paginated view
    this.setState({fuels:json.results})
    //this.setState({serverConnectionFailure:false})
  }

  fetchUserObject({url, objectName, onSuccess}){
    console.log("fetchUserObject")
    apiFetch({
      method:'GET',
      url:url,
      onSuccess:(json)=>{
        if(onSuccess){
          this.setState({[objectName]:json}, onSuccess)
        } else{
          this.setState({[objectName]:json})
        }
      },
      onFailure:(error)=>{
        console.log(`Couldn't fetch ${objectName}:${error}`)
        if(error==='500'){
          this.serverConnectionFailure()
        }
      }
    })
  }

  useState({objectName, json, onSuccess}){
    if(onSuccess){
      this.setState({[objectName]:json}, onSuccess)
    }else{
      this.setState({[objectName]:json})
    }
  }


  login(){
    this.refreshFullProfile()
    this.setState({
      loggedIn:true,
      modal:null,
    })
  }

  useProfileSettings(){
    //console.log(profile)
    this.setState({displayUnits: this.state.profile.display_units})
    //console.log(`Not loading display units from profile: ${profile}`)
  }

  logout(){
    logoutBrowser({onSuccess:this.logoutSuccess})
  }

  logoutSuccess(){
    console.log("Logout successful.")
    console.log(this.defaultState)
    // Reload page to clear user data from state
    // What to do about clearing user data from caches??
    window.location.reload(false)
    //navigate(api.NAV_HOME)
  }

  refreshFullProfile(){
    if(this.state.serverConnectionFailure){
      this.testServer()
      return
    }

    apiFetch({
      url:api.USER_DATA,
      method:'GET',
      onSuccess:(data)=>{
        console.log(data)
        this.setState({
          user:data.user,
          profile:data.profile,
          taxes:data.taxes,
          vehicles:data.vehicles,
          stats:data.stats,
          recipients:data.recipients,
        },
          //onSuccess of setState
          ()=>{
            this.useProfileSettings()
          }
        )
      },
      onFailure:(error)=>{
        console.warn(error)
        console.log("Unable to fetch user data")
        if(error==='500') this.serverConnectionFailure();
      }
    })

    //this.fetchUserObject({url:api.GET_USER, objectName:"user"})
    //this.fetchUserObject({url:api.MY_PROFILE, objectName:"profile", onSuccess:this.useProfileSettings})
    //this.fetchUserObject({url:api.MY_TAXES, objectName:"taxes"})
    //this.fetchUserObject({url:api.MY_VEHICLES, objectName:"vehicles"})
    this.fetchUserObject({url:api.MY_EMISSIONS, objectName:"emissions"}) ///paginated
    //this.fetchUserObject({url:api.MY_STATS, objectName:"stats"})
    //this.fetchUserObject({url:api.MY_RECIPIENTS, objectName:"recipients"})
    this.fetchUserObject({url:api.MY_PAYMENTS, objectName:"payments"}) //paginated
    apiFetch({
      url:api.FUEL_TYPES, 
      method:'GET',
      onSuccess:this.setFuels,
      noAuth:true,
    })
  }

  toggleDisplayUnits(){
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }

  hideModal(){
    this.setState({
      modal:null,
    })
  }

  setModal(type){
    this.setState({modal:type})
  }

  setModalContent(content){
    this.setState({modal:content})
  }

  setMainView(view){
    this.refreshFullProfile()
    this.setState({
      mainView:view,
    })
  }

  handleNavClick(nav){
    //this.refreshFullProfile()

    if(nav==="login"){
      this.setModal(<LoginForm onSuccess={this.login} hideModal={this.hideModal}/>)

    } else if(nav==="logout"){
      this.logout()

    } else if(nav==="demoUser"){
      demoLogin({onSuccess:this.login})

    } else if(nav==="register"){
      this.setModal(<RegistrationForm onSuccess={this.login} hideModal={this.hideModal}/>)

    } else if(nav==="toggleUnits"){
      this.toggleDisplayUnits()  

    } else if(nav==="contact"){
      this.setMainView("contact")
    }
  }
  
  
  render(){
    let modal
    if(this.state.modal){
      modal = this.state.modal
    }

    let loggedIn=this.state.loggedIn
    let displayUnits=this.state.displayUnits
    let fuels=this.state.fuels

    let user=this.state.user
    let profile=this.state.profile
    let stats=this.state.stats

    let taxes=this.state.taxes
    let vehicles=this.state.vehicles
    let emissions=this.state.emissions
    let recipients=this.state.recipients
    let payments=this.state.payments

    let refresh=this.refreshFullProfile
    let setModal=this.setModalContent
    let hideModal=this.hideModal
    let selectView=(event)=>{this.setMainView(event.target.name)}


    return(
      <div style={{ backgroundImage: `url(${api.MARANON_SUNRISE})`, 
                    //backgroundImage: `url(${api.POINT_PERP_NARROW})`, 
                    //backgroundColor:'blue',
                    backgroundSize:'cover',
                    backgroundPosition:'center',
                    //minHeight: "100vh",
                    height:"150vh",
                  }}>
        <BootstrapNavBar 
          loggedIn={this.state.loggedIn}
          onClick={this.handleNavClick}
          displayUnits={this.state.displayUnits}
          profile={this.state.profile}
          stats={this.state.stats}
          serverError={this.state.serverConnectionFailure}
        />
        {modal}
        <div> 
          <Switch>
            <Route path={api.NAV_CALCULATOR}>
              <CenterPage>
                <EmissionCalculator 
                  loggedIn={loggedIn} 
                  displayUnits={displayUnits} 
                  exit={null}
                  taxes={taxes}
                  vehicles={vehicles}
                  fuels={fuels}
                  profile={profile}
                  refresh={refresh}
                  setModal={setModal}
                  hideModal={hideModal}
                  selectView={selectView}
                  login={this.login}
                />
              </CenterPage>
            </Route>
            <Route path={api.NAV_DASHBOARD}>
              {this.state.loggedIn ?
                <CenterPage>
                  <Dashboard 
                    stats={stats}
                    user={user}
                    profile={profile}
                    taxes={taxes}
                    vehicles={vehicles}
                    fuels={fuels}
                    displayUnits={displayUnits}
                    emissions={emissions}
                    payments={payments}
                    recipients={recipients}
                    refresh={refresh}
                    logout={this.logout}
                    setModal={setModal}
                    hideModal={hideModal}
                  />
                </CenterPage>
                : <Redirect to={api.NAV_HOME}/>
              }
            </Route>
            <Route exact path={api.NAV_HOME}>
              <HomeView 
                loggedIn={loggedIn}
              />
            </Route>
            <Route path={api.NAV_PAYMENT}>
              {this.state.loggedIn ?
                <CenterPage>
                  <PaymentView
                    stats={stats}
                    user={user}
                    profile={profile}
                    recipients={recipients}
                    refresh={refresh}
                    setModal={setModal}
                    hideModal={hideModal}
                  />
                </CenterPage>
                : <Redirect to={api.NAV_HOME}/>
              }
            </Route>
            <Route path={api.NAV_CONTACT}>
              <CenterPage>
                <ContactPage 
                  loggedIn={loggedIn}
                  user={user}
                  setModal={setModal}
                  hideModal={hideModal}
                  hideDisplay={null}
                />
              </CenterPage>
            </Route>
          </Switch>
          {/*
          <MainView
            loggedIn={this.state.loggedIn} 
            displayUnits={this.state.displayUnits}
            taxes={this.state.taxes}
            vehicles={this.state.vehicles}
            emissions={this.state.emissions}
            fuels={this.state.fuels}
            profile={this.state.profile}
            stats={this.state.stats}
            user={this.state.user}
            payments={this.state.payments}
            recipients={this.state.recipients}
            refresh={this.refreshFullProfile}
            display={this.state.mainView}
            setView={this.setMainView}
            logout={this.logout}
            setModal={this.setModalContent}
            hideModal={this.hideModal}
          />*/}
        </div>
        <VerticalSpacer/>
      </div>
    )
  }
}


ReactDOM.render(
  <Router>
    <App />
  </Router>, 
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();