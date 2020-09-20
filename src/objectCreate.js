import React from 'react';
import {Modal} from 'react-bootstrap';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import { VehicleInput } from './vehicleInput.js';
import { VehicleSaveForm } from './vehicleSave.js';
import {fetchObject} from './helperFunctions.js';
import {StandardModal, LabelledInput, FormRow} from './reactComponents.js';
import { MAX_LEN_RECIP_NAME, MAX_LEN_RECIP_COUNTRY, MAX_LEN_RECIP_WEB_LINK, MAX_LEN_RECIP_DONATION_LINK, MAX_LEN_RECIP_DESCRIPTION, MAX_LEN_NAME} from './constants.js';

export class CreateTax extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      createNew: false,
      newName: "",
      newPrice: 0,
      newCategory: "",
      categoryList:[],
    }

    this.buildCategoryList=this.buildCategoryList.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.submitNewTax=this.submitNewTax.bind(this)
    this.validateNewTax=this.validateNewTax.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  componentDidMount(){
    this.buildCategoryList()
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  buildCategoryList(){
    let categoryList=[]
    for(let i in taxCategories){
      categoryList.push(taxCategories[i]['title'])
    }
    this.setState({
      categoryList:categoryList,
      newCategory:categoryList[0]
    })
  }

  handleChange(event){
    this.setState({
      [event.target.name]:event.target.value
    })
  }

  validateNewTax(){
    this.setState({submissionPending:true})

    //Check fields are filled
    if(!this.state.newName || !this.state.newPrice || !this.state.newCategory){
      this.returnError("All fields are required.")
      return false
    }

    //Check name isn't used
    let existingTaxes=this.props.existingTaxes
    for(let i in existingTaxes){
      if(this.state.newName===existingTaxes[i].name && this.state.newCategory===existingTaxes[i].category){
        this.returnError("A tax of this name already exists.")
        return false
      }
    }
    this.submitNewTax()
  }

  submitNewTax(){

    let taxData = {
      name: this.state.newName,
      price_per_kg: parseFloat(this.state.newPrice).toFixed(TAX_RATE_DECIMALS),
      category: this.state.newCategory,
    }

    fetchObject({
      url:'/user/my-taxes/',
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
    let body = 
      <form>
        <input type="text" name="newName" maxLength={MAX_LEN_NAME} onChange={this.handleChange} className="form-control my-2" placeholder="Name"/>
        <LabelledInput
          input={<input type="number" name="newPrice" onChange={this.handleChange} className="form-control" placeholder="Price"/>}
          append={`succes${this.props.profile.currency_symbol}/kg CO2`}
        />
        <OptionListInput name="newCategory" list={this.state.categoryList} onChange={this.handleChange} />
        <p>{this.state.errorMessage}</p>
      </form>

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
  constructor(props){
    super(props)

    this.state={
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    }

    this.receiveInputs=this.receiveInputs.bind(this)
    this.handleClick=this.handleClick.bind(this)
    this.cancelNewVehicle=this.cancelNewVehicle.bind(this)
    this.handleSave=this.handleSave.bind(this)
  }

  receiveInputs(lPer100Km, fuelId, name){
    this.setState({
      lPer100Km:lPer100Km,
      fuelId:fuelId,
      name:name,
    })
  }

  cancelNewVehicle(){
    this.setState({
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    })
  }

  handleClick(event){
    if(event.target.name==="createVehicle"){
      this.setState({createNew:true})
    }
  }

  handleSave(){
    this.setState=({
      createNew:false,
      lPer100Km:null,
      fuelId:null,
      name:"",
    })
    this.props.refresh()
  }

  render(){
    let display
    if(!this.state.createNew){
      display = <td><button name="createVehicle" className="btn btn-outline-primary" onClick={this.handleClick}>+ New Vehicle</button></td>
    } else {
      display =
        <td colspan="4" >
          <VehicleInput 
            displayUnits={this.props.displayUnits} 
            fuels={this.props.fuels}
            returnEconomy={this.receiveInputs}
            setModal={this.props.setModal}
            hideModal={this.props.hideModal}
            initialValues={{}}
          />
          <VehicleSaveForm 
            cancel={this.cancelNewVehicle}
            name={this.state.name}
            lPer100Km={this.state.lPer100Km}
            fuelId={this.state.fuelId}
            onSave={this.handleSave}
          />
        </td>
    }
    return(display)
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

    fetchObject({
      url:'/donation-recipients/',
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

    let data = {"recipients":newRecipientList}
    //console.log(data)
    fetchObject({
      url:`/profile/${this.props.profile.id}/`,
      method:'PATCH',
      data:data,
      onSuccess:this.successModal,
      onFailure:this.handlePostFailure,
    })
  }

  successModal(){
    let json = this.state.newRecipient
    this.props.refresh()
    this.props.returnId(json.id)

    let title = <div>New: {json.name}</div>
    let body = <p>{json.description}</p>
    let footer = 
      <div>
        <a href={json.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info m-2">Website</a>
        <a href={json.donation_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info m-2">Donation</a>
      </div>
    this.props.setModal(<StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer}/>)
  }

  handlePostFailure(json){
    console.log(json)
    this.returnError("Unable to save new recipient.")
  }

  render(){
    let errorMessage
    if(this.state.errorMessage){
      errorMessage = <p><strong>{this.state.errorMessage}</strong></p>
    }

    let title = <div>Create Recipient</div>
    let form = 
      <form>
        <FormRow
            label={<div>Name:</div>}
            labelWidth={3}
            input={<input type="text" name="name" placeholder="Required" maxLength={MAX_LEN_RECIP_NAME} className="form-control my-2" onChange={this.handleChange}/>}
        />
        <FormRow
          label={<div>Country:</div>}
          labelWidth={3}
          input={<input type="text" name="country" placeholder="Country" maxLength={MAX_LEN_RECIP_COUNTRY} className="form-control my-2" onChange={this.handleChange}/>}
        />
        <FormRow
          label={<div>Website:</div>}
          labelWidth={3}
          input={<input type="text" name="website" placeholder="Website url" maxLength={MAX_LEN_RECIP_WEB_LINK} className="form-control my-2" onChange={this.handleChange}/>} 
        /> 
        <FormRow
          label={<div>Donation:</div>}
          labelWidth={3}
          input={<input type="text" name="donation_link" placeholder="Donation page url" maxLength={MAX_LEN_RECIP_DONATION_LINK} className="form-control my-2" onChange={this.handleChange}/>}
        />
        <label>
          Description:
        </label>
        <br/>
        <textarea type="area" name="description" maxLength={MAX_LEN_RECIP_DESCRIPTION} className="form-control my-2" onChange={this.handleChange} rows="6"/> 
        {errorMessage}
      </form>

    let formButtons = 
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button type="button" className="btn btn-success m-2" onClick={this.validateForm}><strong>Submit</strong></button>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={form} footer={formButtons} />
  }
}