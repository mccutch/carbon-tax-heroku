import React from 'react';
import {Navbar} from 'react-bootstrap';
import {validateEmailRegex} from './validation.js';
import {fetchObject} from './helperFunctions.js';
import {StandardModal} from './reactComponents.js';

class ContactForm extends React.Component{
  constructor(props){
    super(props)
    this.submit=this.submit.bind(this)
  }

  submit(e){
    e.preventDefault()
    this.props.onSubmit()
  }

  render(){
    let submitBtn = (this.props.submitted) ? 
      <button className="btn btn-success" disabled >Submit</button>
      : <button className="btn btn-success" onClick={this.submit}>Submit</button>

    return(
      <div className="form p-4">
        <p><strong>{this.props.errorMessage}</strong></p>
        <input type="email" name="returnEmail" defaultValue={this.props.defaultEmail} placeholder="Contact email address" onChange={this.props.onChange} className="form-control"/>
        <br/>
        <textarea name="message" placeholder="Message" rows="5" onChange={this.props.onChange}  className="form-control"/>
        <br/>
        {submitBtn}
      </div>
    )
  }
}

export class ContactPage extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      returnEmail:"",
      message:"", 
      errorMessage:"",   
    }

    if(this.props.loggedIn){
      this.state.returnEmail=this.props.user.email
    }

    this.handleChange=this.handleChange.bind(this)
    this.validateInputs=this.validateInputs.bind(this)
    this.handleFailure=this.handleFailure.bind(this)
    this.handleSuccess=this.handleSuccess.bind(this)
    this.formatMessage=this.formatMessage.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  validateInputs(){
    console.log("VALIDATE INPUTS")
    if(!(this.state.message && this.state.returnEmail)){
      this.setState({errorMessage:"Please complete all fields."})
      return false
    }
    if(!validateEmailRegex(this.state.returnEmail)){
      this.setState({errorMessage:"Invalid email address."})
      return false
    }
    this.setState({errorMessage:""})
    this.submit()
  }

  formatMessage(){
    let text = this.state.message

    return(
      <div>
        <h1>This is the header</h1>
        <p>{text}</p>
      </div>
    )
  }

  submit(){
    console.log("Submit")
    this.setState({submitted:true})
    
    let contactData = {
      email:this.state.returnEmail,
      message:this.state.message,
      htmlMessage:this.formatMessage(),
    }

    console.log(contactData)
    fetchObject({
      url:'/contact-form/',
      method:'POST',
      data: contactData,
      onSuccess: this.handleSuccess,
      onFailure: this.handleFailure,
      noAuth: (this.props.loggedIn ? false:true),
    })
  }

  handleFailure(response){
    console.log(response)
    this.setState({errorMessage:"Unable to process contact form. Please try again.", submitted:false})
  }

  handleSuccess(response){
    console.log("Contact success")
    this.displaySuccessModal(this.state.returnEmail)
  }

  displaySuccessModal(email){
    let title = <div>Message sent</div>
    let body = 
      <div>
        <p>Thanks for getting in touch, we'll get back to you at <strong>{email}</strong> shortly.</p>
      </div>
    this.props.setModal(<StandardModal hideModal={this.props.hideModal} title={title} body={body} />)
    this.props.hideDisplay()
  }

  render(){
    return(
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Contact
          </Navbar.Brand>
        </Navbar>
        </div>
        <ContactForm 
          onChange={this.handleChange} 
          errorMessage={this.state.errorMessage} 
          defaultEmail={this.state.returnEmail} 
          onSubmit={this.validateInputs}
          submitted={this.state.submitted}
        />
      </div>
    )
  }
}