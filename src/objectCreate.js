import React from 'react';
import {Modal} from 'react-bootstrap';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import { VehicleInput } from './vehicleInput.js';
import { VehicleSaveForm } from './vehicleSave.js';
import {apiFetch} from './helperFunctions.js';
import {StandardModal, LabelledInput, FormRow} from './reactComponents.js';
import {MAX_LEN_NAME} from './constants.js';
import * as api from './urls.js';
import * as forms from './forms.js';

export class CreateTax extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      createNew: false,
      name: "",
      price_per_kg: 0,
      category: taxCategories[0].title,
    }

    this.handleChange=this.handleChange.bind(this)
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.submitNewTax=this.submitNewTax.bind(this)
    this.validateNewTax=this.validateNewTax.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  handleChange(event){
    let value=event.target.value
    if(event.target.name==="price_per_kg") value/=this.props.profile.conversion_factor
    this.setState({[event.target.name]:value})
  }

  validateNewTax(){
    this.setState({submissionPending:true})

    //Check fields are filled
    if(!this.state.name || !this.state.price_per_kg || !this.state.category){
      this.returnError("All fields are required.")
      return false
    }

    //Check name isn't used
    let existingTaxes=this.props.existingTaxes
    for(let i in existingTaxes){
      if(this.state.name===existingTaxes[i].name && this.state.category===existingTaxes[i].category){
        this.returnError("A tax of this name already exists.")
        return false
      }
    }
    this.submitNewTax()
  }

  submitNewTax(){

    let taxData = {
      name: this.state.name,
      price_per_kg: parseFloat(this.state.price_per_kg).toFixed(TAX_RATE_DECIMALS),
      category: this.state.category,
    }

    apiFetch({
      url:api.MY_TAXES,
      method:'POST',
      data:taxData,
      onSuccess:this.handlePostSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handlePostSuccess(){
    this.props.refresh()
    this.props.hideModal()
  }

  handlePostFailure(){
    this.returnError("Unable to create new tax")
  }

  render(){
    let title = <div>Create Tax</div>
    let body = <forms.TaxForm profile={this.props.profile} onChange={this.handleChange} errorMessage={this.state.errorMessage}/>
    let footer = 
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button type="button" className={`btn btn-success m-2 ${this.state.submissionPending?"disabled":""}`} onClick={this.validateNewTax}><strong>Save</strong></button>  
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}


export class CreateVehicle extends React.Component{
  /*
  Render a VehicleInput and VehiceSaveForm.
  Maintain state on vehicle input to render the save form.
  */
  

  render(){
    return <td><button name="createVehicle" className="btn btn-outline-primary" onClick={this.handleClick}>+ New Vehicle</button></td>

  }
}

export class CreateRecipient extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.handleChange=this.handleChange.bind(this)
    this.validateForm=this.validateForm.bind(this)
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.addToUser=this.addToUser.bind(this)
    this.successModal=this.successModal.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  handleChange(event){
    let name=event.target.name
    let value=event.target.value
    this.setState({[name]:value})
  }

  returnError(message){
    this.setState({
      submissionPending:false,
      errorMessage:message
    })
  }

  validateForm(e){
    e.preventDefault()
    this.setState({
      errorMessage:"",
      submissionPending:true,
    })

    if(!this.state.name){
      this.returnError("Name field is required.")
      return
    }
    let fields = ["name", "country", "website", "donation_link", "description"]
    
    let recipientData = {}
    for (let i in fields){
      recipientData[fields[i]]=this.state[fields[i]]
    }

    apiFetch({
      url:api.RECIPIENTS,
      method:'POST',
      data:recipientData,
      onSuccess:this.handlePostSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handlePostSuccess(json){
    //console.log(json)
    this.setState({newRecipient:json})
    this.addToUser(json.id)
  }

  addToUser(id){
    let newRecipientList = this.props.profile.recipients
    newRecipientList.push(id)

    let data = {recipients:newRecipientList}
    //console.log(data)
    apiFetch({
      url:`${api.PROFILE}/${this.props.profile.id}/`,
      method:'PATCH',
      data:data,
      onSuccess:this.successModal,
      onFailure:this.handlePostFailure,
    })
  }

  successModal(){
    let json = this.state.newRecipient
    this.props.app.refresh()
    if(this.props.returnId){this.props.returnId(json.id)}

    let title = <div>New: {json.name}</div>
    let body = <p>{json.description}</p>
    let footer = 
      <div>
        <a href={json.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info m-2">Website</a>
        <a href={json.donation_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info m-2">Donation</a>
      </div>
    this.props.app.setModal(<StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer}/>)
  }

  handlePostFailure(json){
    console.log(json)
    this.returnError("Unable to save new recipient.")
  }

  render(){
    let title = <div>Create Recipient</div>
    let form = <forms.RecipientForm onChange={this.handleChange} errorMessage={this.state.errorMessage}/>
    let formButtons = 
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Cancel</button>
        <button type="button" className="btn btn-success m-2" onClick={this.validateForm}><strong>Submit</strong></button>
      </div>

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={form} footer={formButtons} />
  }
}