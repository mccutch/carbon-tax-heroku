import React from 'react';
import {Modal, Navbar} from 'react-bootstrap';
import {validateEmailRegex} from './validation.js';
import {fetchObject} from './helperFunctions.js';

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
    return(
      <div className="form p-4">
        <input type="text" name="returnEmail" defaultValue={this.props.defaultEmail} placeholder="Contact email address" onChange={this.props.onChange} className="form-control"/>
        <br/>
        <input type="text" name="message" placeholder="Message" onChange={this.props.onChange}  className="form-control"/>
        <br/>
        <button className="btn btn-outline-success" onClick={this.submit}>Submit</button>
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

    if(this.props.user){
      this.state.returnEmail=this.props.user.email
    }

    this.handleChange=this.handleChange.bind(this)
    this.validateInputs=this.validateInputs.bind(this)
    this.handleFailure=this.handleFailure.bind(this)
    this.handleSuccess=this.handleSuccess.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  validateInputs(){
    console.log("VALIDATE INPUTS")
    if(!(this.state.email && this.state.returnEmail)){
      return false
    }
    if(!validateEmailRegex(this.state.email)){
      return false
    }

    this.submit()
  }

  submit(){
    let contactData = {
      email:this.state.returnEmail,
      message:this.state.message,
      user:(this.props.user) ? this.props.user.id : 0,
    }
    fetchObject({
      url:'/contact/',
      method:'POST',
      data: contactData,
      onSuccess: this.handleSuccess,
      onFailure: this.handleFailure,
    })
  }

  handleFailure(response){
    console.log(response)
    this.setState({errorMessage:"Unable to process contact form. Please try again."})
  }

  handleSuccess(response){
    console.log("Contact success")
    console.log(response)
    this.displaySuccessModal(response)
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
        />
      </div>
    )
  }
}