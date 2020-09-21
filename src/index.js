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
import * as serviceWorker from './serviceWorker.js';
import {GoogleDirections} from './googleDirections.js';
import {USER_CACHE} from './constants.js';


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
    this.useState = this.useState.bind(this)
  }

  componentDidMount(){
    fetchObject({
      url:"/fueltypes/", 
      onSuccess:this.setFuels,
      onFailure:this.serverConnectionFailure,
      noAuth:true,
    })
    this.fetchObject({url:"/user/current-user/", objectName:"user", onSuccess:this.login})
  }

  serverConnectionFailure(){
    this.setState({serverConnectionFailure:true})
  }

  setFuels(json){
    // fueltypes returns as a paginated view
    this.setState({fuels:json.results})
    this.setState({serverConnectionFailure:false})
  }

  /*
  fetchObject({url, objectName, onSuccess}){
    /* 
    Function stores the returned data from GET request into this.state.
    Designed to be used to retrieve objects belonging to the user from the database.
    If JWT access has expired, a new token is requested, then the function called again.
    

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
  */

  async fetchObject({url, objectName, onSuccess}){
    console.log("FETCHOBJECT")
    // fetch cache first

    // start fetch from server
    let serverResponse = fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      }
    })
    .then(res => {
      console.log(res)
      if(res.ok){
        return res.json();
      } else {
        throw new Error(res.status)
      }
    })
    .then(json => {
      console.log(json)
      console.log(`Set state(${objectName}): network`)
      if(onSuccess){
        this.setState({[objectName]:json}, onSuccess)
      } else {
        this.setState({[objectName]:json})
      }
      
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

    // if cache contains url
      // retrieve and setState
    /*
    const cachedResponse = await caches.match(url);
    if (cachedResponse){
      console.log("CACHED content found")
      console.log(cachedResponse.json)
      this.useState(cachedResponse)
    }
    */
    window.caches.match(USER_CACHE).then(function(cache) {
      cache.match(url)
    }).then(function (cachedResponse){
        if(cachedResponse){
          console.log("CACHED content found")
          console.log(cachedResponse.json)
          this.useState(cachedResponse)
        }else{
          console.log(`No cache response for ${objectName}.`)
        }
        
    }).catch(function (err){
      console.log(`Cache retrieve error: `)
    })
    

    // setState with returned object from server
    //this.useState({objectName:objectName, json:serverResponse, onSuccess:onSuccess})
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

  useProfileSettings(profile){
    //console.log(profile)
    //this.setState({displayUnits: profile.display_units})
    
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

    //this.setState(this.defaultState)
    //this.setState(JSON.parse(this.defaultState))
    //this.setState({loggedIn:false})
    //this.state = JSON.parse(JSON.stringify(this.defaultState))
  }

  refreshFullProfile(){
    this.fetchObject({url:"/user/current-user/", objectName:"user"})
    this.fetchObject({url:"/user/my-profile/", objectName:"profile", onSuccess:this.useProfileSettings})
    //this.fetchObject({url:"/user/my-taxes/", objectName:"taxes"})
    //this.fetchObject({url:"/user/my-vehicles/", objectName:"vehicles"})
    //this.fetchObject({url:"/user/my-emissions/", objectName:"emissions"})
    //this.fetchObject({url:"/user/my-stats/", objectName:"stats"})
    //this.fetchObject({url:"/user/my-recipients/", objectName:"recipients"})
    //this.fetchObject({url:"/user/my-payments/", objectName:"payments"})
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
    

    } else if(nav==="contact"){
      this.setMainView("contact")
    }
  }
  
  
  render(){
    let modal
    if(this.state.modal){
      modal = this.state.modal
    }

    return( 
      <div className="bg-dark" style={{ backgroundImage: `url("/static/pointPerpNarrow.jpg")`, 
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
serviceWorker.register();