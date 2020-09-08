import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {LoginWrapper} from './loginWrapper.js';
import {Sandbox} from './sandbox.js';
import * as units from './unitConversions';
import {refreshToken}  from './myJWT.js';
import {fetchObject} from './helperFunctions.js';
import {MainView} from './mainView.js';
import {NavBar} from './navBar.js';
import {LoginForm, logoutBrowser, demoLogin} from './loginWrapper.js';
import {RegistrationForm} from './registrationForm.js';
//import * as serviceWorker from './serviceWorker.js';

import {GoogleDirections} from './googleDirections.js';


class App extends React.Component {
  constructor(props){
    super(props)

    this.defaultState = {
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

    this.state = this.defaultState

    this.login=this.login.bind(this)
    this.logout=this.logout.bind(this)
    this.logoutSuccess=this.logoutSuccess.bind(this)
    this.toggleDisplayUnits=this.toggleDisplayUnits.bind(this)
    
    this.fetchObject = this.fetchObject.bind(this)
    this.refreshFullProfile = this.refreshFullProfile.bind(this)
    this.setFuels = this.setFuels.bind(this)
    this.serverConnectionFailure = this.serverConnectionFailure.bind(this)
    this.useProfileSettings = this.useProfileSettings.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.handleNavClick = this.handleNavClick.bind(this)
    this.setModal = this.setModal.bind(this)
    this.setMainView = this.setMainView.bind(this)
    this.setModalContent = this.setModalContent.bind(this)
  }

  componentDidMount(){
    fetchObject({
      url:"/fueltypes/", 
      onSuccess:this.setFuels,
      onFailure:this.serverConnectionFailure,
      noAuth:true,
    })
    this.fetchObject({url:"/current-user/", objectName:"user", onSuccess:this.login})
  }

  serverConnectionFailure(){
    this.setState({serverConnectionFailure:true})
  }

  setFuels(json){
    // fueltypes returns as a paginated view
    this.setState({fuels:json.results})
    this.setState({serverConnectionFailure:false})
  }

  fetchObject({url, objectName, onSuccess}){
    /* 
    Function stores the returned data from GET request into this.state.
    Designed to be used to retrieve objects belonging to the user from the database.
    If JWT access has expired, a new token is requested, then the function called again.
    */

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      }
    })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        throw new Error(res.status)
      }
    })
    .then(json => {
      this.setState({[objectName]:json})
      if(onSuccess){
        //console.log("onSuccess provided to fetchObject.")
        onSuccess(json)
      }
      //console.log(json)
    })
    .catch(e => {
      console.log(e.message)
      if(e.message==='401'){
        refreshToken({
          onSuccess:this.fetchObject, 
          success_args:[{
            url:url, 
            objectName:objectName, 
            onSuccess:onSuccess
          }]
        })
      }else if(e.message==='500'){
        this.serverConnectionFailure()
      }
    });
  }


  login(){
    this.refreshFullProfile()
    this.setState({
      loggedIn:true,
      modal:null,
    })
  }

  useProfileSettings(profile){
    //console.log(profile)
    this.setState({displayUnits: profile.display_units})
    
  }

  logout(){
    logoutBrowser({onSuccess:this.logoutSuccess})
  }

  logoutSuccess(){
    console.log("Logout successful.")
    this.setState(this.defaultState)
  }

  refreshFullProfile(){
    this.fetchObject({url:"/current-user/", objectName:"user"})
    this.fetchObject({url:"/my-profile/", objectName:"profile", onSuccess:this.useProfileSettings})
    this.fetchObject({url:"/my-taxes/", objectName:"taxes"})
    this.fetchObject({url:"/my-vehicles/", objectName:"vehicles"})
    this.fetchObject({url:"/my-emissions/", objectName:"emissions"})
    this.fetchObject({url:"/my-stats/", objectName:"stats"})
    this.fetchObject({url:"/my-recipients/", objectName:"recipients"})
    this.fetchObject({url:"/my-payments/", objectName:"payments"})
    fetchObject({
      url:"/fueltypes/", 
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
    this.refreshFullProfile()

    if(nav==="login"){
      this.setModal(<LoginForm onSuccess={this.login} hideModal={this.hideModal}/>)

    } else if(nav==="logout"){
      this.logout()

    } else if(nav==="demoUser"){
      demoLogin({onSuccess:this.login})

    } else if(nav==="register"){
      this.setModal(<RegistrationForm onSuccess={this.login} hideModal={this.hideModal}/>)

    } else if(nav==="newEmission"){
      this.setMainView("emissionCalculator")

    } else if(nav==="newPayment"){
      this.setMainView("payment")

    } else if(nav==="dashboard"){
      this.setMainView("dashboard")

    } else if(nav==="contact"){
      this.setMainView("contact")

    } else if(nav==="about"){
      this.setMainView("about")

    } else if(nav==="home"){
      this.setMainView("home")
    
    } else if(nav==="toggleUnits"){
      this.toggleDisplayUnits()
    }

  }
  
  
  render(){
    let modal
    if(this.state.modal){
      modal = this.state.modal
    }

    return( 
      <div className="bg-dark" style={{ backgroundImage: `url("/static/pointPerp.jpg")`, 
                                        /*backgroundRepeat:'no-repeat',*/
                                        backgroundSize:'cover',
                                        height: "200vh",
                                      }}>
        <NavBar 
          loggedIn={this.state.loggedIn}
          onClick={this.handleNavClick}
          displayUnits={this.state.displayUnits}
          profile={this.state.profile}
          stats={this.state.stats}
          serverError={this.state.serverConnectionFailure}
        />
        {modal}
        <div>
        {/*}
          <LoginWrapper 
            loggedIn={this.state.loggedIn}
            logout={this.logout} 
            toggleDisplayUnits={this.toggleDisplayUnits} 
            taxes={this.state.taxes}
            user={this.state.user}
            profile={this.state.profile}
            vehicles={this.state.vehicles}
            emissions={this.state.emissions}
            displayUnits={this.state.displayUnits}
            fuels={this.state.fuels}
            stats={this.state.stats}
            refresh={this.refreshFullProfile}
          />
        */}
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
          />
        </div>
      </div>
    )
  }
}


ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.register();