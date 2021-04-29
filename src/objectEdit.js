import React from 'react';
import { TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import * as units from './unitConversions';
import { apiFetch, getAttribute, displayCurrency, sleep, encodeEmissionFormat} from './helperFunctions.js';
import { ObjectSelectionList, FormRow, StandardModal, LabelledInput, PendingBtn } from './reactComponents.js';
import * as api from './urls.js';
import { ECONOMY_DECIMALS, MAX_LEN_RECIP_NAME, MAX_LEN_RECIP_COUNTRY, MAX_LEN_RECIP_WEB_LINK, MAX_LEN_RECIP_DONATION_LINK, MAX_LEN_RECIP_DESCRIPTION, MAX_LEN_NAME} from './constants.js';
import * as forms from './forms.js';


export class TaxBackDate extends React.Component{
  constructor(props){
    super(props)
    this.state = {}
    this.listEmissions=this.listEmissions.bind(this)
    this.handleFetchFailure=this.handleFetchFailure.bind(this)
    this.applyChange=this.applyChange.bind(this)
    this.handleBackdateSuccess=this.handleBackdateSuccess.bind(this)
  }

  componentDidMount(){
    apiFetch({
      url:`${api.BACKDATE_TAX_CHANGE}/${this.props.tax.id}/`,
      method:"GET", 
      onSuccess:this.listEmissions, 
      onFailure:this.handleFetchFailure,
    })
  }

  listEmissions(emissionList){
    console.log("list emissionList")
    console.log(emissionList)
    if(emissionList.all.length===0){
      sleep(500).then(()=>{
        this.props.app.hideModal()
      })
    } else {
      this.setState({
        allEmissions:emissionList.all,
        countAll:emissionList.all.length,
        sincePaymentEmissions:emissionList.sincePayment,
        countSincePayment:emissionList.sincePayment.length,
        paymentDate:emissionList.paymentDate,
      })
    }
  }

  handleFetchFailure(response){
    console.log(response)
  }

  applyChange(event){
    apiFetch({
      url:`${api.BACKDATE_TAX_CHANGE}/${this.props.tax.id}/`,
      method:'POST',
      data:{apply_to: event.target.name}, 
      onSuccess:this.handleBackdateSuccess, 
      onFailure:this.handleFetchFailure,
    })
  }

  handleBackdateSuccess(response){
    console.log("Changed applied.")
    console.log(response)
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  render(){
    let tax = this.props.tax
    let title = <div>Backdate this tax change?</div>

    let body, applySincePaymentButton 
    if(this.state.allEmissions){
      let displayText, showSincePaymentButton
      if(this.state.paymentDate){
        displayText = <p>This tax has been used for {this.state.countAll} emissions, {this.state.countSincePayment} since your last payment on {this.state.paymentDate}.</p>
        showSincePaymentButton = <button className="btn btn-outline-info m-2">Show since payment</button>
        applySincePaymentButton = <button className="btn btn-outline-info m-2" name="sincePayment" onClick={this.applyChange}>All since last payment</button>
      } else {
        displayText = <p>This tax has been used for {this.state.countAll} emissions.</p>
      }

      body = 
        <div>
          {displayText}
          {/*<button className="btn btn-outline-info m-2">Show all</button>
          {showSincePaymentButton}*/}
        </div>
    } else {
      body = <div>Loading emissions...</div>
    }

    let footer = 
    <div>
      <div className="row">
        <button className="btn btn-outline-success m-2" name="all" onClick={this.applyChange}>Apply to all</button>
        <button className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Apply to none</button>
        {applySincePaymentButton}
      </div>
    </div>

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
  }
}


export class TaxEdit extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      errorMessage:"",
      submissionPending:false,
    }

    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.deleteTax=this.deleteTax.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
    this.deleteSuccess=this.deleteSuccess.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  deleteTax(){
    let key = this.props.tax.id
    apiFetch({
      url:`${api.TAX}/${key}/`,
      method:'DELETE',
      onSuccess:this.deleteSuccess,
      onFailure:this.editFailure,
    })
  }

  validateInput(){
    this.setState({submissionPending:true})
    if(!(this.state.price_per_kg || this.state.name || this.state.category)){
      this.props.app.hideModal()
    }

    if(this.state.name===""){
        this.returnError("Name cannot be blank")
        return
    } 

    let allTaxes = this.props.allTaxes
    for(let i in allTaxes){
      if(allTaxes[i].name===this.props.tax.name){
        continue
      } else {
        if(allTaxes[i].name===this.state.name){
          this.returnError("Name must be unique")
          return
        }
      }
    }

    this.saveChange()  
  }

  saveChange(){
    let key = this.props.tax.id
    let taxData = {}
    let fields = ['name', 'category']
    for(let i in fields){
      if(this.state[fields[i]]){
        taxData[fields[i]]=this.state[fields[i]]
      }
    }
    
    if(this.state.price_per_kg){
      taxData['price_per_kg']=parseFloat(this.state.price_per_kg).toFixed(TAX_RATE_DECIMALS)
    }

    console.log(taxData)
    apiFetch({
      url:`${api.TAX}/${key}/`,
      method:'PATCH',
      data:taxData,
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  deleteSuccess(response){
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  editSuccess(json){
    this.props.app.refresh()
    this.props.app.setModal(<TaxBackDate tax={json} app={this.props.app}/>)
  }

  editFailure(){
    this.returnError("Unable to save change.")
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  render(){
    let currencyFactor = this.props.userData.profile.conversion_factor
    console.log(`factor:${currencyFactor}`)
    let existingValue=parseFloat(this.props.tax.price_per_kg*currencyFactor)
    let sym = this.props.userData.profile.currency_symbol

    let title=<div>Edit Tax</div>
    let body =
      <forms.TaxForm tax={this.props.tax} userData={this.props.userData} onChange={this.handleChange} errorMessage={this.state.errorMessage}/>

    let footer = 
      <div>
        <button className="btn btn-outline-primary m-2" name="save" onClick={this.validateInput}>Save</button>
        {this.props.tax.isDefault ? "" : <button className="btn btn-outline-dark m-2" name="delete" onClick={this.deleteTax}>Delete</button>}
        <button className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Cancel</button>
      </div>   

    return(
      <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
    )
  }
}

export class VehicleEdit extends React.Component{
  constructor(props){
    super(props)
    this.state = {

    }

    this.handleChange=this.handleChange.bind(this)
    this.deleteVehicle=this.deleteVehicle.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({lPer100Km: units.convert(event.target.value, this.props.app.displayUnits)})
    } else if(event.target.name==="name"){
      this.setState({name:event.target.value})
    } else if(event.target.name==="fuel"){
      this.setState({fuel:parseInt(event.target.value)})
    }
  }

  deleteVehicle(){
    this.setState({submissionPending:true})
    let key = parseInt(this.props.vehicle.id).toString()
    apiFetch({
      url:`${api.VEHICLE}/${key}/`,
      method:'DELETE',
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  validateInput(){
    this.setState({submissionPending:true})
    
    if(!this.state.name && !this.state.lPer100Km &&!this.state.fuel){
      // No input data
      this.props.app.hideModal()
    } 

    //No validation to apply yet.
    this.saveChange()
  }

  saveChange(){
    if(this.validateInput){
      console.log("SAVE CHANGE")
      let key = this.props.vehicle.id

      let vehicleData ={}
      if(this.state.name){
        vehicleData['name']=this.state.name
      }
      if(this.state.lPer100Km){
        vehicleData['economy']=parseFloat(this.state.lPer100Km).toFixed(ECONOMY_DECIMALS)
      }
      if(this.state.fuel){
        vehicleData['fuel']=`${this.state.fuel}`
      }

      apiFetch({
        url:`${api.VEHICLE}/${key}/`,
        method:'PATCH',
        data:vehicleData,
        onSuccess:this.editSuccess,
        onFailure:this.editFailure,
      })
    }
  }

  editSuccess(){
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  editFailure(){
    this.returnError("Unable to save changes.")
  }

  render(){
    let title = <div>Edit Vehicle</div>
    let body =  <forms.VehicleForm 
                  onChange={this.handleChange} 
                  vehicle={this.props.vehicle} 
                  errorMessage={this.state.errorMessage} 
                  app={this.props.app}
                />
    let footer = 
      <div>
        <PendingBtn className="btn-outline-primary m-2" onClick={this.validateInput} pending={this.state.submissionPending}>Save</PendingBtn>
        <PendingBtn className="btn-outline-dark m-2" onClick={this.deleteVehicle} pending={this.state.submissionPending}>Delete</PendingBtn>
        <button className={`btn btn-outline-danger m-2`} name="cancel" onClick={this.props.app.hideModal}>Cancel</button>
      </div>

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
  }
}

export class EmissionEdit extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      distance:this.props.emission.distance,
      fuel:this.props.emission.fuel,
      economy:this.props.emission.economy,
      split:this.props.emission.split,
      co2_output_kg:this.props.emission.co2_output_kg,
      tax_type:this.props.emission.tax_type,
      price:this.props.emission.price,
      offset:this.props.emission.offset,
      errorMessage:"",
    }

    this.handleClick=this.handleClick.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.prepareData=this.prepareData.bind(this)
    this.saveNew=this.saveNew.bind(this)
    this.saveChanges=this.saveChanges.bind(this)
    this.saveSuccess=this.saveSuccess.bind(this)
    this.updateFailure=this.updateFailure.bind(this)
    this.cloneFailure=this.cloneFailure.bind(this)
    this.delete=this.delete.bind(this)
    this.deleteFailure=this.deleteFailure.bind(this)
    this.recalculate=this.recalculate.bind(this)
  }

  handleClick(event){
    let name = event.target.name

    if(name==="cancelEdit"){
      this.props.app.hideModal()
    } else if(name==="clone" || name==="update"){
      this.prepareData(name)
    } else if(name==="delete"){
      this.delete()
    }
  }

  handleChange(event){
    let name = event.target.name
    let value = event.target.value

    if(name==="tax_type" || name==="fuel"){
      value=parseInt(value)
    }
    if(name==="distance"){
      value=units.convertToKm(value, this.props.app.displayUnits)
    }
    if(name==="economy"){
      value=units.convert(value, this.props.app.displayUnits)
    }
    if(name==="split"){
      value = (value>0? value : 1)
    }
    if(name==="duration"){
      name = "distance"
      value = value/60
    }
    if(name==="offset"){
      value = value/this.props.userData.profile.conversion_factor
    }
    this.setState({
      [name]:value,
      willSave:true,
    }, this.recalculate)
  }

  recalculate(){
    console.log("RECALCULATE")
    let fuelCarbonPerL = getAttribute({key:"id", keyValue:this.state.fuel, objectList:this.props.app.fuels, attribute:"co2_per_unit"})
    let taxPrice = getAttribute({key:"id", keyValue:this.state.tax_type, objectList:this.props.userData.taxes, attribute:"price_per_kg"})

    let co2_output_kg 
    let format = this.props.emission.format_encoding
    if(format===encodeEmissionFormat("road")){
      co2_output_kg = (this.state.distance/100)*this.state.economy*fuelCarbonPerL/(this.state.split)
    } else if(format===encodeEmissionFormat("airDistance")){
      co2_output_kg = (this.state.distance)*this.state.economy
    } else if(format===encodeEmissionFormat("airTime")){
      co2_output_kg = (this.state.distance)*this.state.economy
    }


    this.setState({
      taxPrice:taxPrice,
      co2_output_kg: (co2_output_kg).toFixed(3),
      price: (co2_output_kg*taxPrice-this.state.offset).toFixed(2),
    })
  }

  prepareData(method){
    this.setState({errorMessage:""})
    let emissionAttributes = ['name', 'date', 'distance', 'economy', 'fuel', 'split', 'co2_output_kg', 'tax_type', 'price', 'format_encoding', 'offset']
    let emissionData = {}
    for(let i in emissionAttributes){
      let attribute = emissionAttributes[i]
      if(this.state[attribute]){
        emissionData[attribute]=this.state[attribute]
      } else if(method==="clone"){
        emissionData[attribute]=this.props.emission[attribute]
      }
    }
    if(method==="clone"){
      this.saveNew(emissionData)
    } else if(method==="update"){
      this.saveChanges(emissionData)
    }
  }

  saveNew(data){
    apiFetch({
      url:api.MY_EMISSIONS,
      method:'POST',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.cloneFailure,
    })
  }

  saveChanges(data){
    if(!this.state.willSave){
      this.props.app.hideModal()
    }
    let key = this.props.emission.id
    apiFetch({
      url:`${api.EMISSION}/${key}/`,
      method:'PATCH',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.updateFailure,
    })
  }

  saveSuccess(){
    console.log("Save success")
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  cloneFailure(){
    this.setState({errorMessage:"Unable to clone emission."})
  }

  updateFailure(){
    this.setState({errorMessage:"Unable to save changes."})
  }

  delete(){
    let key = this.props.emission.id
    apiFetch({
      url:`${api.EMISSION}/${key}/`,
      method:'DELETE',
      onSuccess:this.saveSuccess,
      onFailure:this.deleteFailure,
    })
  }

  deleteFailure(){
    this.setState({errorMessage:"Unable to delete emission."})
  }

  render(){
    let emission=this.props.emission
    let displayUnits=this.props.app.displayUnits
    let format = emission.format_encoding
    let distance = format===encodeEmissionFormat("airTime") ? emission.distance : (units.distanceDisplay(emission.distance, displayUnits)).toFixed(1)
    let economy = (units.convert(emission.economy, displayUnits)).toFixed(2)
    let title = <div>Edit Emission</div>

     
    let roadTripFields
    if(format===encodeEmissionFormat("road")){
      roadTripFields = 
        <div>
          <FormRow
            label={<div>Fuel:</div>}
            labelWidth={4}
            input={<ObjectSelectionList name="fuel" defaultValue={emission.fuel} list={this.props.app.fuels} value="id" label="name" onChange={this.handleChange}/>}
          />
          <FormRow
            label={<div>Economy:</div>}
            labelWidth={4}
            input = {
              <LabelledInput
                input={<input type="number" name="economy" defaultValue={economy} onChange={this.handleChange} className="form-control" step="0.1"/>}
                append={units.string(displayUnits)}
              />
            }
          />
          <FormRow
            label={<div>Split:</div>}
            labelWidth={4}
            input={<input type="number" name="split" defaultValue={emission.split} onChange={this.handleChange} className="form-control"/>}
          />
        </div>
    } else {
      roadTripFields = 
          <FormRow
            label={<div>Offset:</div>}
            labelWidth={4}
            input={<LabelledInput
                      input={<input type="number" name="offset" defaultValue={(emission.offset*this.props.userData.profile.conversion_factor).toFixed(2)} onChange={this.handleChange} className="form-control"/>}
                      prepend={this.props.userData.profile.currency_symbol}
                  />}
          />
    }

    let distanceField = format===encodeEmissionFormat("airTime") ?
        <FormRow
          label={<div>Duration:</div>}
          labelWidth={4}
          input={<LabelledInput
                    input={<input type="number" name="duration" defaultValue={distance*60} onChange={this.handleChange} className="form-control"/>}
                    append="minutes"
                />}
        />
        :
        <FormRow
          label={<div>Distance:</div>}
          labelWidth={4}
          input={<LabelledInput
                    input={<input type="number" name="distance" defaultValue={distance} onChange={this.handleChange} className="form-control"/>}
                    append={units.distanceString(displayUnits)}
                />}
        />

    let body = 
      <form className="container">
        <p>{this.state.errorMessage}</p>
        <div className="form-group form-row">
          <input type="text" name="name" maxLength="60" placeholder="Trip Name" defaultValue={emission.name} onChange={this.handleChange} className="form-control"/>
        </div>
        <div className="form-group form-row">
          <input type="date" name="date" defaultValue={emission.date} onChange={this.handleChange} className="form-control"/>
        </div>
        <FormRow
          label={<div>Tax Type:</div>}
          labelWidth={4}
          input={<ObjectSelectionList name="tax_type" defaultValue={emission.tax_type} list={this.props.userData.taxes} value="id" label="name" onChange={this.handleChange}/>}
        />
        {distanceField}
        {roadTripFields}
        <br/>
        CO2 Output: <strong>{parseFloat(this.state.co2_output_kg).toFixed(1)}kg</strong>
        <br/>
        Price: <strong>{displayCurrency(this.state.price, this.props.userData.profile)}</strong>
      </form>

    let footer = 
      <div>
        <button name="update" className="btn btn-outline-primary m-2" onClick={this.handleClick}>Save changes</button>
        <button name="clone" className="btn btn-outline-success m-2" onClick={this.handleClick}>Save as new</button>
        <button name="cancelEdit" className="btn btn-outline-danger m-2" onClick={this.handleClick}>Cancel edit</button>
        <button name="delete" className="btn btn-outline-dark m-2" onClick={this.handleClick}>Delete</button>
      </div>

    return <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
  }
}




export class PaymentEdit extends React.Component{
  constructor(props){
    super(props)

    this.state = {
    }

    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.deletePayment=this.deletePayment.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
  }

  deletePayment(){
    let key = this.props.payment.id

    apiFetch({
      url:`${api.PAYMENT}/${key}/`,
      method:'DELETE',
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  validateInput(){
    return true  
  }

  saveChange(event){
    let mode=event.target.name


    if(this.validateInput()){
      let key = this.props.payment.id

      let paymentData = {}
      let paymentFields = ["amount", "recipient", "date"]

      for(let i in paymentFields){
        let field = paymentFields[i]
        if(this.state[field]){
          paymentData[field]=this.state[field]
        } else {
          if(mode==="clone"){
            paymentData[field]=this.props.payment[field]
          }
        }
      }

      console.log(paymentData)
      if(mode==="update"){
        apiFetch({
          url:`${api.PAYMENT}/${key}/`,
          method:'PATCH',
          data:paymentData,
          onSuccess:this.editSuccess,
          onFailure:this.editFailure,
        })
      } else {
        apiFetch({
          url:api.MY_PAYMENTS,
          method:'POST',
          data:paymentData,
          onSuccess:this.editSuccess,
          onFailure:this.editFailure,
        })
      }
    }
  }

  editSuccess(){
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  editFailure(){
    this.setState({
      error:true
    })
  }

  handleChange(event){
    let name=event.target.name
    let value=event.target.value

    if(name==="amount"){
      value=parseFloat(value/this.props.userData.profile.conversion_factor).toFixed(2)
    } else if(name==="recipient"){
      value=parseInt(value)
    }
    this.setState({[name]:value})
  }

  render(){
    let payment = this.props.payment
    let profile = this.props.userData.profile
    let prevAmount = parseFloat(payment.amount*profile.conversion_factor).toFixed(2)
    let sym = profile.currency_symbol

    let body = 
      <form>
        <label>
          Amount:
          <LabelledInput
            input={<input type="number" name="amount" className="form-control" defaultValue={prevAmount} onChange={this.handleChange}/>}
            prepend = {`${sym}${profile.currency}`}
          />
        </label>
        <br/>
        <label>
          Recipient:
           <ObjectSelectionList name="recipient" onChange={this.handleChange} list={this.props.userData.recipients} value="id" label="name" defaultValue={this.props.payment.recipient}/>
        </label>
        <br/>
        <input defaultValue={payment.date} type="date" name="date" className="form-control" onChange={this.handleChange}/>
      </form>

    let footer = 
      <div>
        <button name="update" className="btn btn-outline-primary m-2" onClick={this.saveChange}>Save changes</button>
        <button name="clone" className="btn btn-outline-success m-2" onClick={this.saveChange}>Save as new</button>
        <button name="cancelEdit" className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Cancel edit</button>
        <button name="delete" className="btn btn-outline-dark m-2" onClick={this.deletePayment}>Delete</button>
      </div>

    return(
      <StandardModal
        hideModal={this.props.app.hideModal}
        title={<div>Edit Payment</div>}
        body={body}
        footer={footer}
      />
    )
  }
}


export class RecipientEdit extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      errorMessage:"",
      submissionPending:false,
    }

    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.delete=this.delete.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
    this.deleteSuccess=this.deleteSuccess.bind(this)
    this.returnError=this.returnError.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      submissionPending:false,
    })
  }

  delete(){
    let key = this.props.recipient.id

    apiFetch({
      url:`${api.RECIPIENT}/${key}/`,
      method:'DELETE',
      onSuccess:this.deleteSuccess,
      onFailure:this.editFailure,
    })
  }

  validateInput(){
    this.setState({submissionPending:true})
    this.saveChange() 
  }

  saveChange(){
    
    let key = this.props.recipient.id

    let recipientData = {}
    let fields = ["name", "country", "description", "donation_link", "website"]
    for(let i in fields){
      if(this.state[fields[i]]){
        recipientData[fields[i]]=this.state[fields[i]]
      }
    }

    console.log(recipientData)
    apiFetch({
      url:`${api.RECIPIENT}/${key}/`,
      method:'PATCH',
      data:recipientData,
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
    
  }

  deleteSuccess(response){
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  editSuccess(json){
    this.props.app.refresh()
    this.props.app.hideModal()
  }

  editFailure(){
    this.returnError("Unable to save change.")
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  render(){
    let recipient=this.props.recipient
  
    let title=<div>Edit Tax</div>

    let body =
      <forms.RecipientForm 
        recipient={recipient}
        onChange={this.handleChange}
        errorMessage={this.state.errorMessage}
      />

    let footer = 
      <div>
        <button className={`btn btn-outline-primary m-2 ${this.state.submissionPending?"disabled":""}`} onClick={this.validateInput}>Save</button>
        <button className="btn btn-outline-dark m-2" onClick={this.delete}>Delete</button>
        <button className="btn btn-outline-danger m-2" onClick={this.props.app.hideModal}>Cancel</button>
      </div>   

    return(
      <StandardModal hideModal={this.props.app.hideModal} title={title} body={body} footer={footer} />
    )
  }
}





