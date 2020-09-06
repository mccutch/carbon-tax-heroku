import React from 'react';
import { OptionListInput } from './optionListInput.js';
import { TAX_RATE_DECIMALS } from './defaultTaxTypes.js';
import * as units from './unitConversions';
import { fetchObject, getAttribute, displayCurrency, sleep, encodeEmissionFormat, displayHrs } from './helperFunctions.js';
import { ECONOMY_DECIMALS } from './fuelTypes.js';
import { ObjectSelectionList, FormRow, StandardModal } from './reactComponents.js';

class TaxBackDate extends React.Component{
  constructor(props){
    super(props)
    this.state = {}
    this.listEmissions=this.listEmissions.bind(this)
    this.handleFetchFailure=this.handleFetchFailure.bind(this)
    this.applyChange=this.applyChange.bind(this)
    this.handleBackdateSuccess=this.handleBackdateSuccess.bind(this)
  }

  componentDidMount(){
    fetchObject({
      url:`/backdate-tax-change/${this.props.tax.id}/`,
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
        this.props.hideModal()
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
    fetchObject({
      url:`/backdate-tax-change/${this.props.tax.id}/`,
      method:'POST',
      data:{apply_to: event.target.name}, 
      onSuccess:this.handleBackdateSuccess, 
      onFailure:this.handleFetchFailure,
    })
  }

  handleBackdateSuccess(response){
    console.log("Changed applied.")
    console.log(response)
    this.props.refresh()
    this.props.hideModal()
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
          <button className="btn btn-outline-info m-2">Show all</button>
          {showSincePaymentButton}
        </div>
    } else {
      body = <div>Loading emissions...</div>
    }

    let footer = 
    <div>
      <div className="row">
        <button className="btn btn-outline-success m-2" name="all" onClick={this.applyChange}>Apply to all</button>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Apply to none</button>
        {applySincePaymentButton}
      </div>
    </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}

class TaxEdit extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      newValue:false,
    }

    this.editTax=this.editTax.bind(this)
    this.saveChange=this.saveChange.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.validateInput=this.validateInput.bind(this)
    this.deleteTax=this.deleteTax.bind(this)
    this.editSuccess=this.editSuccess.bind(this)
    this.editFailure=this.editFailure.bind(this)
    this.deleteSuccess=this.deleteSuccess.bind(this)
  }

  deleteTax(){
    let key = parseInt(this.props.tax.id).toString()

    fetchObject({
      url:`/tax/${key}/`,
      method:'DELETE',
      onSuccess:this.deleteSuccess,
      onFailure:this.editFailure,
    })
  }

  editTax(event){
    if(event.target.name==="cancel"){
      this.setState({
        edit:false,
        newValue:null,
      })
    } else if(event.target.name==="edit"){
      this.setState({edit:true})
    }
  }

  validateInput(){
    if(!(this.state.price_per_kg || this.state.name)){
      this.editSuccess()
      return false
    }

    if(this.state.name===""){
        this.setState({error:"Name cannot be blank"})
        return false
    } 

    let allTaxes = this.props.allTaxes
    for(let i in allTaxes){
      if(allTaxes[i].name===this.props.tax.name){
        continue
      } else {
        if(allTaxes[i].name===this.state.name){
          this.setState({error:"Name must be unique"})
          return false
        }
      }
    }
    
    return true  
  }

  saveChange(){
    if(this.validateInput()){
      let key = this.props.tax.id

      let taxData = {}
      if(this.state.name){
        taxData['name']=this.state.name
      }
      if(this.state.price_per_kg){
        taxData['price_per_kg']=parseFloat(this.state.price_per_kg).toFixed(TAX_RATE_DECIMALS)
      }

      console.log(taxData)
      fetchObject({
        url:`/tax/${key}/`,
        method:'PATCH',
        data:taxData,
        onSuccess:this.editSuccess,
        onFailure:this.editFailure,
      })
    }
  }

  deleteSuccess(response){
    this.props.refresh()
    this.props.hideModal()
  }

  editSuccess(json){
    this.props.refresh()
    this.props.setModal(<TaxBackDate tax={json} hideModal={this.props.hideModal} setModal={this.props.setModal} refresh={this.props.refresh}/>)
  }

  editFailure(){
    this.setState({
      error:true
    })
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }


  render(){
    let existingValue=parseFloat(this.props.tax.price_per_kg)
    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    let deleteButton
    if(!this.props.tax.isDefault){
      deleteButton = <button className="btn btn-outline-dark m-2" name="delete" onClick={this.deleteTax}>Delete</button>
    }

    let title=<div>Edit Tax</div>

    let body =
      <div>
        Name:
        <input type="text" name="name" defaultValue={this.props.tax.name} onChange={this.handleChange} placeholder="Name" className="form-control"/>
        <br/>
        Price per kg: {sym}
        <input type="number" name="price_per_kg" defaultValue={existingValue.toFixed(TAX_RATE_DECIMALS)} onChange={this.handleChange} step="0.01" className="form-control"/>
      </div>

    let footer = 
      <div>
        <button className="btn btn-outline-primary m-2" name="save" onClick={this.saveChange}>Save</button>
        {deleteButton}
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
      </div>   

    return(
      <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
    )
  }
}

export class TaxDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
      newValue:null,
      error:false,
    }

    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <TaxEdit 
            tax={this.props.tax}
            taxes={this.props.taxes}
            profile={this.props.profile}
            hideModal={this.props.hideModal} 
            setModal={this.props.setModal}
            refresh={this.props.refresh}
          />
    this.props.setModal(modal)
  }

  

  render(){
    let tax = this.props.tax
    let sym = this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor
    let taxName = <button className="btn btn-outline-primary m-2" onClick={this.edit}>{tax.name}</button>

    return(
      <tr key={tax.id}>
        <td>{taxName}</td>
        <td>{sym}{parseFloat(currencyFactor*tax.price_per_kg).toFixed(TAX_RATE_DECIMALS)}/kg CO2</td>
        <td>{tax.category}</td>
      </tr>
    )
  }
}

class VehicleEdit extends React.Component{
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

  handleChange(event){
    if(event.target.name==="economy"){
      this.setState({lPer100Km: units.convert(event.target.value, this.props.displayUnits)})
    } else if(event.target.name==="name"){
      this.setState({name:event.target.value})
    } else if(event.target.name==="fuel"){
      this.setState({fuel:parseInt(event.target.value)})
    }
  }

  deleteVehicle(){
    let key = parseInt(this.props.vehicle.id).toString()
    fetchObject({
      url:`/vehicle/${key}/`,
      method:'DELETE',
      onSuccess:this.editSuccess,
      onFailure:this.editFailure,
    })
  }

  validateInput(){
    //No validation to apply yet.
    if(this.state.name || this.state.lPer100Km){
      return true
    } else {
      return false
    }
  }

  saveChange(){
    if(this.validateInput){
      console.log("SAVE CHANGE")
      let key = parseInt(this.props.vehicle.id).toString()

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

      fetchObject({
        url:`/vehicle/${key}/`,
        method:'PATCH',
        data:vehicleData,
        onSuccess:this.editSuccess,
        onFailure:this.editFailure,
      })
    }
  }

  editSuccess(){
    this.props.refresh()
    this.props.hideModal()
  }

  editFailure(){
    this.setState({
      error:true
    })
  }

  render(){
    let vehicle=this.props.vehicle
    let existingLPer100Km=units.convert(parseFloat(vehicle.economy), this.props.displayUnits)
    let errorDisplay
    if(this.state.error){
      errorDisplay = <p>Unable to save changes.</p>
    }

    let title = <div>Edit Vehicle</div>

    let body = 
      <div>
        {errorDisplay}
        <input name="name" type="text" placeholder="Vehicle name" defaultValue={vehicle.name} onChange={this.handleChange} className="form-control"/>
        <label>
          <input name="economy" type="number" placeholder="Economy" defaultValue={existingLPer100Km.toFixed(ECONOMY_DECIMALS)} onChange={this.handleChange} step="0.1" className="form-control"/>
          {units.string(this.props.displayUnits)}
        </label>
        <ObjectSelectionList name="fuel" onChange={this.handleChange} list={this.props.fuels} defaultValue={this.props.vehicle.fuel} label="name" value="id" />
      </div>

    let footer = 
      <div>
        <button className="btn btn-outline-primary m-2" name="save" onClick={this.saveChange}>Save</button>
        <button className="btn btn-outline-dark m-2" name="delete" onClick={this.deleteVehicle}>Delete</button>
        <button className="btn btn-outline-danger m-2" name="cancel" onClick={this.props.hideModal}>Cancel</button>
      </div>

    return(
      <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
    )
  }
}


export class VehicleDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      edit:false,
    }

    this.useVehicle=this.useVehicle.bind(this)
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <VehicleEdit 
            vehicle={this.props.vehicle}
            displayUnits={this.props.displayUnits}
            fuels={this.props.fuels}
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
          />
    this.props.setModal(modal)
  }


  useVehicle(){
    this.props.submitEconomy(this.props.vehicle.economy, this.props.vehicle.fuel, this.props.vehicle.name)
    if(this.props.hideModal){
      this.props.hideModal()
    }
  }

  render(){
    let vehicle=this.props.vehicle
    let economy = units.convertFromMetricToDisplayUnits(vehicle.economy, this.props.displayUnits)

    let vehicleName
    if(this.props.submitEconomy){
      vehicleName=<td><button className="btn btn-outline-primary m-2" onClick={this.useVehicle}>{vehicle.name}</button></td>
    } else {
      vehicleName=<td><button className="btn btn-outline-primary m-2" onClick={this.edit}>{vehicle.name}</button></td>
    }

    return(
      <tr key={vehicle.id}>
        {vehicleName}
        <td>{economy.toFixed(1)} {units.displayUnitString(this.props.displayUnits)}</td>
        <td>{getAttribute(vehicle.fuel, this.props.fuels, "name")}</td>
      </tr>
    )
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
      this.props.hideModal()
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
      value=units.convertToKm(value, this.props.displayUnits)
    }
    if(name==="economy"){
      value=units.convert(value, this.props.displayUnits)
    }
    if(name==="split"){
      value = (value>0? value : 1)
    }
    this.setState({
      [event.target.name]:value,
      willSave:true,
    }, this.recalculate)
  }

  recalculate(){
    console.log("RECALCULATE")
    let fuelCarbonPerL = getAttribute(this.state.fuel, this.props.fuels, "co2_per_unit")
    let taxPrice = getAttribute(this.state.tax_type, this.props.taxes, "price_per_kg")

    let co2_output_kg = (this.state.distance/100)*this.state.economy*fuelCarbonPerL/(this.state.split)

    this.setState({
      fuelCarbonPerL:fuelCarbonPerL,
      taxPrice:taxPrice,
      co2_output_kg: (co2_output_kg).toFixed(3),
      price: (co2_output_kg*taxPrice).toFixed(2),
    })
  }

  prepareData(method){
    this.setState({errorMessage:""})
    let emissionAttributes = ['name', 'date', 'distance', 'economy', 'fuel', 'split', 'co2_output_kg', 'tax_type', 'price']
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
    fetchObject({
      url:`/my-emissions/`,
      method:'POST',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.cloneFailure,
    })
  }

  saveChanges(data){
    if(!this.state.willSave){
      this.props.hideModal()
    }
    let key = this.props.emission.id
    fetchObject({
      url:`/emission/${key}/`,
      method:'PATCH',
      data:data,
      onSuccess:this.saveSuccess,
      onFailure:this.updateFailure,
    })
  }

  saveSuccess(){
    console.log("Save success")
    this.props.refresh()
    this.props.hideModal()
  }

  cloneFailure(){
    this.setState({errorMessage:"Unable to clone emission."})
  }

  updateFailure(){
    this.setState({errorMessage:"Unable to save changes."})
  }

  delete(){
    let key = this.props.emission.id
    fetchObject({
      url:`/emission/${key}/`,
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
    let displayUnits=this.props.displayUnits

    let distance = (units.distanceDisplay(emission.distance, displayUnits)).toFixed(1)
    let economy = (units.convert(emission.economy, displayUnits)).toFixed(2)

    let title = <div>Edit Emission</div>

    let body = 
      <form className="container">
        <p>{this.state.errorMessage}</p>
        <div className="form-group row">
          <input type="text" name="name" maxlength="60" placeholder="Trip Name" defaultValue={emission.name} onChange={this.handleChange} className="form-control"/>
        </div>
        <div className="form-group row">
          <input type="date" name="date" defaultValue={emission.date} onChange={this.handleChange} className="form-control"/>
        </div>
        <FormRow
          label={<div>Tax Type:</div>}
          labelWidth={4}
          input={<ObjectSelectionList name="tax_type" defaultValue={emission.tax_type} list={this.props.taxes} value="id" label="name" onChange={this.handleChange}/>}
        />
        <FormRow
          label={<div>Distance: ({units.distanceString(displayUnits)})</div>}
          labelWidth={4}
          input={<input type="number" name="distance" defaultValue={distance} onChange={this.handleChange} className="form-control"/>}
        />
        <FormRow
          label={<div>Fuel:</div>}
          labelWidth={4}
          input={<ObjectSelectionList name="fuel" defaultValue={emission.fuel} list={this.props.fuels} value="id" label="name" onChange={this.handleChange}/>}
        />
        <FormRow
          label={<div>Economy: ({units.string(displayUnits)})</div>}
          labelWidth={4}
          input={<input type="number" name="economy" defaultValue={economy} onChange={this.handleChange} className="form-control" step="0.1"/>}
        />
        <FormRow
          label={<div>Split:</div>}
          labelWidth={4}
          input={<input type="number" name="split" defaultValue={emission.split} onChange={this.handleChange} className="form-control"/>}
        />
        <br/>
        CO2 Output: <strong>{this.state.co2_output_kg}kg</strong>
        <br/>
        Price: <strong>{displayCurrency(this.state.price, this.props.profile)}</strong>
      </form>

    let footer = 
      <div>
        <button name="update" className="btn btn-outline-primary m-2" onClick={this.handleClick}>Save changes</button>
        <button name="clone" className="btn btn-outline-success m-2" onClick={this.handleClick}>Save as new</button>
        <button name="cancelEdit" className="btn btn-outline-danger m-2" onClick={this.handleClick}>Cancel edit</button>
        <button name="delete" className="btn btn-outline-dark m-2" onClick={this.handleClick}>Delete</button>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}

export class EmissionDetail extends React.Component{
  constructor(props){
    super(props)

    this.edit=this.edit.bind(this)
  }


  edit(){
    let modal = 
          <EmissionEdit 
            emission={this.props.emission} 
            displayUnits={this.props.displayUnits} 
            profile={this.props.profile} 
            taxes={this.props.taxes} 
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
            fuels={this.props.fuels}
          />
    this.props.setModal(modal)
  }

  render(){
    let displayUnits=this.props.displayUnits
    let emission=this.props.emission
    let sym=this.props.profile.currency_symbol
    let currencyFactor = this.props.profile.conversion_factor

    let distance
    let format = this.props.emission.format_encoding
    if(format===encodeEmissionFormat("road") || format===encodeEmissionFormat("airDistance")){
      let dist=units.distanceDisplay(emission.distance, displayUnits)
      let distString=units.distanceString(displayUnits)
      distance = `${parseFloat(dist).toFixed(1)}${distString}`
    }else if(format===encodeEmissionFormat("airTime")){
      distance = displayHrs(this.props.emission.distance)
    }

    let display = 
        <tr key={emission.id}>
          <td><button className="btn btn-outline-primary m-2" onClick={this.edit}><strong>{emission.name}</strong></button></td>
          <td>{emission.date}</td>
          <td>{getAttribute(emission.tax_type, this.props.taxes, "name")}</td>
          <td>{distance}</td>
          <td>{emission.split}</td>
          <td>{parseFloat(emission.co2_output_kg).toFixed(1)}kg</td>
          <td>{sym}{parseFloat(currencyFactor*emission.price).toFixed(2)}</td>
        </tr>
    
    return display
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

    fetchObject({
      url:`/payment/${key}/`,
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
        fetchObject({
          url:`/payment/${key}/`,
          method:'PATCH',
          data:paymentData,
          onSuccess:this.editSuccess,
          onFailure:this.editFailure,
        })
      } else {
        fetchObject({
          url:`/my-payments/`,
          method:'POST',
          data:paymentData,
          onSuccess:this.editSuccess,
          onFailure:this.editFailure,
        })
      }
    }
  }

  editSuccess(){
    this.props.refresh()
    this.props.hideModal()
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
      value=parseFloat(value/this.props.profile.conversion_factor).toFixed(2)
    } else if(name==="recipient"){
      value=parseInt(value)
    }
    this.setState({[name]:value})
  }


  render(){
    let payment = this.props.payment
    let profile = this.props.profile
    let prevAmount = parseFloat(payment.amount*profile.conversion_factor).toFixed(2)
    let sym = profile.currency_symbol

    let body = 
      <form>
        <label>
          Amount: ({sym}{profile.currency})
          <input type="number" name="amount" className="form-control m-2" defaultValue={prevAmount} onChange={this.handleChange}/>
        </label>
        <br/>
        <label>
          Recipient:
           <ObjectSelectionList name="recipient" onChange={this.handleChange} list={this.props.recipients} value="id" label="name" defaultValue={this.props.payment.recipient}/>
        </label>
        <br/>
        <input defaultValue={payment.date} type="date" name="date" className="form-control" onChange={this.handleChange}/>
      </form>

    let footer = 
      <div>
        <button name="update" className="btn btn-outline-primary m-2" onClick={this.saveChange}>Save changes</button>
        <button name="clone" className="btn btn-outline-success m-2" onClick={this.saveChange}>Save as new</button>
        <button name="cancelEdit" className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel edit</button>
        <button name="delete" className="btn btn-outline-dark m-2" onClick={this.deletePayment}>Delete</button>
      </div>

    return(
      <StandardModal
        hideModal={this.props.hideModal}
        title={<div>Edit Payment</div>}
        body={body}
        footer={footer}
      />
    )
  }
}

export class PaymentDetail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }

    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
          <PaymentEdit 
            payment={this.props.payment}
            profile={this.props.profile}
            hideModal={this.props.hideModal} 
            refresh={this.props.refresh}
            recipients={this.props.recipients}
          />
    this.props.setModal(modal)
  }

  

  render(){
    let payment = this.props.payment
    let edit = <button className="btn btn-outline-primary m-2" onClick={this.edit}>Edit</button>

    return(
      <tr key={payment.id}>
        <td>{payment.date}</td>
        <td>{getAttribute(payment.recipient, this.props.recipients, "name")}</td>
        <td>{displayCurrency(payment.amount, this.props.profile)}</td>
        <td>{edit}</td>
      </tr>
    )
  }
}