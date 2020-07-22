import React from 'react';
import {Navbar, Modal} from 'react-bootstrap';
import {ObjectSelectionList} from './reactComponents.js';
import {CreateRecipient} from './objectCreate.js';
import * as getDate from './getDate.js';
import {fetchObject} from './helperFunctions.js';

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

export class PaymentView extends React.Component{
  constructor(props){
    super(props)

    let defaultAmount = this.props.stats.summary.total_tax-this.props.stats.summary.total_paid

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
  }

  componentDidMount(){
    if(this.props.profile.recipients.length>0){
      this.setState({recipient:this.props.profile.recipients[0]})
    }
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
          paymentData[field] = this.props.stats.summary.total_tax-this.props.stats.summary.total_paid
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

    let body = 
      <div>
        <p>Donation saved to profile.</p>
      </div>

    let buttons = 
      <div>
        <button name="payment" className="btn btn-outline-info m-2" onClick={this.props.selectView}>Make another</button>
        <button name="dashboard" className="btn btn-outline-info m-2" onClick={this.props.selectView}>My Dashboard</button>
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
        balance = parseFloat(conversion*(summary.total_tax-summary.total_paid)).toFixed(2)
      }
    }

    let userRecipientSelection
    if(this.props.recipients.length > 0){
      userRecipientSelection = 
        <label>
          Recipient:
           <ObjectSelectionList name="recipient" onChange={this.handleChange} list={this.props.recipients} value="id" label="name"/>
        </label>
    }

    let errorMessage
    if(this.state.errorMessage){
      errorMessage = <p><strong>{this.state.errorMessage}</strong></p>
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
        <p><strong>Outstanding balance: {sym}{balance}</strong></p>
        <form>
          <label>
            Amount: ({sym}{currency})
            <input type="number" name="amount" className="form-control m-2" defaultValue={(this.state.amount*conversion).toFixed(2)} onChange={this.handleChange}/>
          </label>
          <br/>
          {userRecipientSelection}
          <button className="btn btn-outline-info m-2" onClick={this.addRecipient} >+ New</button>
          <button className="btn btn-outline-info m-2" onClick={this.searchRecipients}>Search</button>
          <br/>
          <input defaultValue={getDate.today()} type="date" name="date" className="form-control" onChange={this.handleChange}/>
          <br/>
          {errorMessage}
          <button className="btn btn-success m-2" onClick={this.makePayment}>Record payment</button>
        </form> 
      </div>
    )
  }
}