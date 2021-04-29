import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss'; // import custom bootstrap

import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';
import {refreshToken}  from './myJWT.js';
import {apiFetch, testServer} from './helperFunctions.js';
import {NavBar, BootstrapNavBar} from './navBar.js';
import {LoginForm, logoutBrowser, demoLogin} from './loginWrapper.js';
//import {RegistrationForm} from './registrationForm.js';
import * as serviceWorker from './serviceWorker.js';
import {GoogleDirections} from './googleDirections.js';
import {USER_CACHE, DEFAULT_DISPLAY_UNITS} from './constants.js';
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
      displayUnits: DEFAULT_DISPLAY_UNITS,
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

    this.logout=this.logout.bind(this)
    this.logoutSuccess=this.logoutSuccess.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    
    this.fetchUserObject = this.fetchUserObject.bind(this)
    this.refreshFullProfile = this.refreshFullProfile.bind(this)
    this.setFuels = this.setFuels.bind(this)
    this.serverConnectionFailure = this.serverConnectionFailure.bind(this)
    this.handleNavClick = this.handleNavClick.bind(this)
    this.testServer = this.testServer.bind(this)
  }

  componentDidMount(){
    this.refreshFullProfile()
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

  setFuels(){
    // fueltypes returns as a paginated view
    apiFetch({
      url:api.FUEL_TYPES, 
      method:'GET',
      onSuccess:(json)=>this.setState({fuels:json.results}),
      noAuth:true,
    })
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

  logout(){
    logoutBrowser({onSuccess:this.logoutSuccess})
  }

  logoutSuccess(){
    console.log("Logout successful.")
    console.log(this.defaultState)
    // Reload page to clear user data from state
    window.location.reload(false)
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
          displayUnits:data.profile.display_units,
          taxes:data.taxes,
          vehicles:data.vehicles,
          stats:data.stats,
          recipients:data.recipients,
          loggedIn:true,
        },
          //onSuccess of setState
          ()=>{
            console.log("User data fetch success.")
          }
        )
      },
      onFailure:(error)=>{
        console.warn(error)
        console.log("Unable to fetch user data")
        if(error==='500') this.serverConnectionFailure();
      }
    })

    this.fetchUserObject({url:api.MY_EMISSIONS, objectName:"emissions"}) ///paginated
    this.fetchUserObject({url:api.MY_PAYMENTS, objectName:"payments"}) //paginated
    this.setFuels()
  }

  toggleDisplayUnits(){
    console.log("Toggle units")
    this.setState({displayUnits:units.toggle(this.state.displayUnits)})
  }

  handleNavClick(nav){
    this.refreshFullProfile()

    if(nav==="login"){
      this.setState({modal:<LoginForm onSuccess={this.refreshFullProfile} hideModal={this.hideModal}/>})

    } else if(nav==="logout"){
      this.logout()

    } else if(nav==="demoUser"){
      console.log("Do nothing")
      //demoLogin({onSuccess:this.refreshFullProfile})


    } else if(nav==="toggleUnits"){
      this.toggleDisplayUnits()  

    }
  }
  
  
  render(){
    console.log("render app")
    let app = {
      refresh:this.refreshFullProfile,
      setModal:(modal)=>this.setState({modal:modal}),
      hideModal:()=>this.setState({modal:null}),
      logout:this.logout,
      displayUnits:this.state.displayUnits,
      loggedIn:this.state.loggedIn,
      fuels:this.state.fuels,
      serverError:this.state.serverConnectionFailure,
      toggleDisplayUnits:this.toggleDisplayUnits,
    }

    console.log(app)

    let userData = {
      user:this.state.user,
      profile:this.state.profile,
      taxes:this.state.taxes,
      stats:this.state.stats,
      vehicles:this.state.vehicles,
      emissions:this.state.emissions,
      recipients:this.state.recipients,
      payments:this.state.payments,
    }


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
          onClick={this.handleNavClick}
          app={app}
          userData={userData}
        />
        {this.state.modal ? this.state.modal : ""}
        <div> 
          <Switch>
            <Route path={api.NAV_CALCULATOR}>
              <CenterPage>
                <EmissionCalculator 
                  app={app}
                  userData={userData}
                />
              </CenterPage>
            </Route>
            <Route path={api.NAV_DASHBOARD}>
              {this.state.loggedIn ?
                <CenterPage>
                  <Dashboard
                    app={app}
                    userData={userData}
                  />
                </CenterPage>
                : <Redirect to={api.NAV_HOME}/>
              }
            </Route>
            <Route exact path={api.NAV_HOME}>
              <HomeView 
                app={app}
              />
            </Route>
            <Route path={api.NAV_PAYMENT}>
              {this.state.loggedIn ?
                <CenterPage>
                  <PaymentView
                    app={app}
                    userData={userData}
                  />
                </CenterPage>
                : <Redirect to={api.NAV_HOME}/>
              }
            </Route>
            <Route path={api.NAV_CONTACT}>
              <CenterPage>
                <ContactPage
                  app={app}
                  userData={userData}
                />
              </CenterPage>
            </Route>
          </Switch>
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