import React from 'react';
import {Modal} from 'react-bootstrap';
import { OptionListInput } from './optionListInput.js';
import { taxCategories, TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import { VehicleInput } from './vehicleInput.js';
import { VehicleSaveForm } from './vehicleSave.js';
import {fetchObject} from './helperFunctions.js';
import { MAX_NAME_LEN } from './validation.js';
import { CurrencySelection } from './reactComponents.js';
import { DEFAULT_CURRENCY, MAX_LEN_RECIP_NAME, MAX_LEN_RECIP_COUNTRY, MAX_LEN_RECIP_WEB_LINK, MAX_LEN_RECIP_DONATION_LINK, MAX_LEN_RECIP_CURRENCY, MAX_LEN_RECIP_DESCRIPTION} from './constants.js';

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
  }

  componentDidMount(){
    this.buildCategoryList()
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
    //Check name isn't used
    let existingTaxes=this.props.existingTaxes
    for(let i in existingTaxes){
      if(this.state.newName===existingTaxes[i].name && this.state.newCategory===existingTaxes[i].category){
        this.setState({error:"A tax of this name already exists."})
        return false
      }
    }
    return true
  }

  submitNewTax(){

    if(!this.validateNewTax()){
      return
    }

    let taxData = {
      name: this.state.newName,
      price_per_kg: parseFloat(this.state.newPrice).toFixed(TAX_RATE_DECIMALS),
      category: this.state.newCategory,
    }

    fetchObject({
      url:'/my-taxes/',
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
    this.setState({error: "Unable to create new tax"})
  }

  render(){
    let errorDisplay
    if(this.state.error){
      errorDisplay=<p>{this.state.error}</p>
    }

    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Tax</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorDisplay}
          <label>
            Name:
            <input type="text" name="newName" maxLength={MAX_NAME_LEN} onChange={this.handleChange}/>
          </label>
          <br/>
          <label>
            Price per kg:
            <input type="number" name="newPrice" onChange={this.handleChange}/>
          </label>
          <label>
            Category:
            <OptionListInput name="newCategory" list={this.state.categoryList} onChange={this.handleChange} />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-primary" onClick={this.submitNewTax}>Submit</button>
          <button className="btn btn-outline-danger" onClick={this.props.hideModal}>Cancel</button>
        </Modal.Footer>
      </Modal>
    )

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
        <td colspan="4">
          <VehicleInput 
            displayUnits={this.props.displayUnits} 
            fuels={this.props.fuels}
            returnEconomy={this.receiveInputs}
            setModal={this.props.setModal}
            hideModal={this.props.hideModal}
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
    this.state={
      currency:DEFAULT_CURRENCY,
    }
    this.handleChange=this.handleChange.bind(this)
    this.validateForm=this.validateForm.bind(this)
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.addToUser=this.addToUser.bind(this)
    this.successModal=this.successModal.bind(this)
  }

  handleChange(event){
    let name=event.target.name
    let value=event.target.value

    this.setState({[name]:value})
  }

  validateForm(e){
    e.preventDefault()
    this.setState({errorMessage:""})

    let fields = [
      "name", "country", "currency", "website", "donation_link", "description"
    ]

    let recipientData = {}
    for (let i in fields){
      let field = fields[i]
      if(!this.state[field]){
        this.setState({errorMessage:"Please fill in all fields."})
        return
      }
      recipientData[field]=this.state[field]
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
    this.props.refresh()
    let json = this.state.newRecipient
    let modal = 
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>New: {json.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{json.description}</p>
        </Modal.Body>
        <Modal.Footer>
          <a href={json.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info">Website</a>
          <a href={json.donation_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info">Donation</a>
        </Modal.Footer>
      </Modal>

    this.props.setModal(modal)
  }

  handlePostFailure(json){
    console.log(json)
    this.setState({errorMessage:"Unable to save new recipient."})
  }

  render(){
    let errorMessage
    if(this.state.errorMessage){
      errorMessage = <p><strong>{this.state.errorMessage}</strong></p>
    }

    let form = 
      <form>
        <label>
          Name:
          <input type="text" name="name" maxLength={MAX_LEN_RECIP_NAME} className="form-control m-2" onChange={this.handleChange}/> 
        </label>
        <br/> 
        <label>
          Country:
          <input type="text" name="country" maxLength={MAX_LEN_RECIP_COUNTRY} className="form-control m-2" onChange={this.handleChange}/> 
        </label>
        <br/> 
        <label>
          Currency:
          <CurrencySelection name="currency" onChange={this.handleChange} defaultValue={DEFAULT_CURRENCY}/> 
        </label>
        <br/>
        <label>
          Website:
          <input type="text" name="website" maxLength={MAX_LEN_RECIP_WEB_LINK} className="form-control m-2" onChange={this.handleChange}/> 
        </label> 
        <br/>  
        <label>
          Donation Link:
          <input type="text" name="donation_link" maxLength={MAX_LEN_RECIP_DONATION_LINK} className="form-control m-2" onChange={this.handleChange}/> 
        </label>
        <br/>
        <label>
          Description:
        </label>
        <br/>
        <textarea type="area" name="description" maxLength={MAX_LEN_RECIP_DESCRIPTION} className="form-control m-2" onChange={this.handleChange} rows="6"/> 
        {errorMessage}
      </form>

    let formButtons = 
      <div>
        <button type="button" className="btn btn-outline-primary m-2" onClick={this.validateForm}>Submit</button>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
      </div>

    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Recipient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {form}
        </Modal.Body>
        <Modal.Footer>
          {formButtons}
        </Modal.Footer>
      </Modal>
    )
  }
}