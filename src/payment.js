import React from 'react';
import {Navbar, Modal} from 'react-bootstrap';
import {ObjectSelectionList, FormRow, LabelledInput} from './reactComponents.js';
import {CreateRecipient} from './objectCreate.js';
import * as getDate from './getDate.js';
import {fetchObject, displayCurrency} from './helperFunctions.js';
import {PaymentEdit} from './objectDetail.js';

export class SearchRecipients extends React.Component{


  render(){

    return(
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Find Donation Recipients</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Search for donation avenues from other users. Not implemented yet.</p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-primary" onClick={this.submitNewTax}>Submit</button>
          <button className="btn btn-outline-danger" onClick={this.props.hideModal}>Cancel</button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export class PaymentSuccess extends React.Component{
  constructor(props){
    super(props)

    this.goTo=this.goTo.bind(this)
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

  goTo(event){
    this.props.setView(event.target.name)
    this.props.hideModal()
  }

  render(){
    let payment=this.props.payment
    let prevBalance = this.props.stats.summary.balance

    let body = 
      <div>
        <p>Donation saved to profile.</p>
        <p>Paid: {displayCurrency(payment.amount, this.props.profile)}</p>
        <p>Balance remaining: {displayCurrency(prevBalance-payment.amount, this.props.profile)}</p>
      </div>

    let buttons = 
      <div>
        <button name="payment" className="btn btn-outline-info m-2" onClick={this.goTo}>New payment</button>
        <button name="dashboard" className="btn btn-outline-info m-2" onClick={this.goTo}>My Dashboard</button>
        <button name="edit" className="btn btn-outline-info m-2" onClick={this.edit}>Edit/Clone</button>
      </div>

    let modal = 
      <Modal show={true} onHide={this.props.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Saved</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
        </Modal.Body>
        <Modal.Footer>
          {buttons}
        </Modal.Footer>
      </Modal>

    return modal
  }
}

export class PaymentView extends React.Component{
  constructor(props){
    super(props)

    let defaultAmount = this.props.stats ? this.props.stats.summary.balance : 0

    this.state = {
      amount:(defaultAmount>0 ? defaultAmount : 0),
      date:getDate.today(),
      errorMessage:"",
    }

    this.addRecipient=this.addRecipient.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.searchRecipients=this.searchRecipients.bind(this)
    this.makePayment=this.makePayment.bind(this)
    this.handlePostSuccess=this.handlePostSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.setNewRecipient=this.setNewRecipient.bind(this)
  }

  componentDidMount(){
    if(this.props.recipients.length>0){
      this.setState({recipient:this.props.recipients[0].id})
    }
  }

  componentDidUpdate(prevProps){
    // Change value displayed by selectionList after new recipient is added
    if(this.state.newRecipient && prevProps.recipients!==this.props.recipients){
      console.log(`setting selectionList to ${this.state.newRecipient}`)
      let selectionList = document.getElementById("recipient")
      selectionList.value = this.state.newRecipient
      this.setState({
        newRecipient:false,
      })
    }
  }

  setNewRecipient(id){
    console.log(`New recipient: ${id}`)
    this.setState({
      recipient:id,
      newRecipient:id,
    })
  }

  handleChange(event){
    event.preventDefault()
    let value=event.target.value
    let name=event.target.name
    if(name==="amount"){
      value = value/this.props.profile.conversion_factor
    } else if(name==="recipient"){
      value = parseInt(value)
    }
    this.setState({[event.target.name]:value})
  }

  addRecipient(event){
    event.preventDefault()
    let modal = 
      <CreateRecipient
        profile={this.props.profile}
        refresh={this.props.refresh}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
        returnId={this.setNewRecipient}
      />
    this.props.setModal(modal)
  }

  searchRecipients(event){
    event.preventDefault()
    let modal = 
      <SearchRecipients 
        hideModal={this.props.hideModal}
      />
    this.props.setModal(modal)
  }

  makePayment(event){
    event.preventDefault()
    this.setState({errorMessage:""})

    let paymentFields = ["amount", "recipient", "date"]
    let paymentData = {}

    for(let i in paymentFields){
      let field = paymentFields[i]
      if(this.state[field]){
        paymentData[field]=this.state[field]
      } else {
        if(field==="amount"){
          paymentData[field] = this.props.stats.summary.balance
        } else if(field==="recipient"){
          console.log("No recipient listed.")
        }
      }
    }
    console.log(paymentData)

    fetchObject({
      url:'/my-payments/',
      method:'POST',
      data:paymentData,
      onSuccess:this.handlePostSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handlePostSuccess(json){
    console.log(json)
    
    let modal = 
      <PaymentSuccess
        payment={json}
        profile={this.props.profile}
        recipients={this.props.recipients}
        refresh={this.props.refresh}
        stats={this.props.stats}
        setModal={this.props.setModal}
        hideModal={this.props.hideModal}
        setView={this.props.setView}
      />

    this.props.setModal(modal)
    this.props.setView("home")
  }

  handlePostFailure(){
    this.setState({errorMessage:"Unable to save payment to profile."})
  }

  render(){

    let summary, sym, conversion, currency
    let balance = "$0.00"
    conversion = this.props.profile.conversion_factor
    sym = this.props.profile.currency_symbol
    currency = this.props.profile.currency
    if(this.props.stats && this.props.profile){
      summary = this.props.stats.summary
      if(summary){
        balance = parseFloat(conversion*(summary.balance)).toFixed(2)
      }
    }


    return(
      <div className='container-sm my-2 bg-light' > 
        <div style={{margin: "0px -15px 0px -15px"}} >
        <Navbar bg="info" variant="dark">
          <Navbar.Brand >
            Make a Payment
          </Navbar.Brand>
        </Navbar>
        </div>
        <br/>
        <p><strong>Outstanding balance: {sym}{balance}</strong></p>
        <form>
          <LabelledInput
            input={<input type="number" name="amount" className="form-control" defaultValue={(this.state.amount*conversion).toFixed(2)} onChange={this.handleChange}/>}
            prepend={`${sym}${currency}`}
            className="my-2"
          />
          {(this.props.recipients.length > 0) ? 
            <div className="form-row">
              <div className="col-8">
                <ObjectSelectionList name="recipient" onChange={this.handleChange} list={this.props.recipients} value="id" label="name"/>
              </div>
              <div className="col">
                <button className="btn btn-outline-info btn-block my-2" onClick={this.addRecipient} >+ New</button>
              </div>
            </div>
            : <button className="btn btn-outline-info btn-block my-2" onClick={this.addRecipient} >+ Create new recipient</button>
          }
          {/*<button className="btn btn-outline-info m-2" onClick={this.searchRecipients}>Search</button>*/}
          <input defaultValue={getDate.today()} type="date" name="date" className="form-control my-2" onChange={this.handleChange}/>
          <p><strong>{this.state.errorMessage}</strong></p>
          <button className="btn btn-success m-2" onClick={this.makePayment}>Save payment</button>
        </form> 
      </div>
    )
  }
}