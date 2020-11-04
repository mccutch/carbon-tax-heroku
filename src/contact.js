import React from 'react';
import {Navbar} from 'react-bootstrap';
import {EmailInput} from './validation.js';
import {apiFetch} from './helperFunctions.js';
import {StandardModal, PendingBtn} from './reactComponents.js';
import * as api from './urls.js';
import {Redirect} from 'react-router-dom';
import {ContactForm} from './forms.js';



export class ContactPage extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      returnEmail:"",
      message:"", 
      errorMessage:"", 
    }

    if(this.props.app.loggedIn){
      this.state.returnEmail=this.props.userData.user.email
      this.state.validEmail=true
    }

    this.handleChange=this.handleChange.bind(this)
    this.validateInputs=this.validateInputs.bind(this)
    this.handleFailure=this.handleFailure.bind(this)
    this.handleSuccess=this.handleSuccess.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  validateInputs(){
    this.setState({
      submissionPending:true,
      errorMessage:"",
      submitted:true,
    })
    console.log("VALIDATE INPUTS")
    if(!(this.state.message && this.state.returnEmail)){
      this.returnError("Please complete all fields.")
      return
    }
    if(!this.state.validEmail){
      this.returnError("Invalid email address.")
      return
    }
    this.submit()
  }


  submit(){
    console.log("Submit")
    let contactData = {
      email:this.state.returnEmail,
      message:this.state.message,
      htmlMessage:"",
    }

    console.log(contactData)
    apiFetch({
      url:api.CONTACT_FORM,
      method:'POST',
      data: contactData,
      onSuccess: this.handleSuccess,
      onFailure: this.handleFailure,
      noAuth: (this.props.app.loggedIn ? false:true),
    })
  }

  handleFailure(response){
    console.log(response)
    this.returnError("Unable to process contact form. Please try again.")
  }

  handleSuccess(response){
    console.log("Contact success")
    this.setState({redirect:api.NAV_HOME})
    this.displaySuccessModal(this.state.returnEmail)
  }

  displaySuccessModal(email){
    let title = <div>Message sent</div>
    let body = <p>Thanks for getting in touch, we'll get back to you at <strong>{email}</strong> shortly.</p>
    this.props.app.setModal(<StandardModal hideModal={this.props.app.hideModal} title={title} body={body} />)
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>
    return(
      <div> 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Contact
          </Navbar.Brand>
        </Navbar>
        </div>
        <div className="row">
          <div className="col mx-5">
            <ContactForm 
              onChange={this.handleChange} 
              errorMessage={this.state.errorMessage} 
              defaultEmail={this.state.returnEmail}
              returnValidation={(bool)=>{this.setState({validEmail:bool})}}
              emailIsValid={this.state.validEmail}
              submitted={this.state.submitted}
              returnEmail={this.state.returnEmail}
            />
            <PendingBtn className="btn-success btn-block my-2" pending={this.state.submissionPending} onClick={this.validateInputs}>Send</PendingBtn>
          </div>
        </div>
      </div>
    )
  }
}