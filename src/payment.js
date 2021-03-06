import React from 'react';
import {Navbar, Modal} from 'react-bootstrap';
import {ObjectSelectionList, FormRow, LabelledInput, StandardModal} from './reactComponents.js';
import {CreateRecipient} from './objectCreate.js';
import * as getDate from './getDate.js';
import {apiFetch, displayCurrency} from './helperFunctions.js';
import {PaymentEdit} from './objectEdit.js';
import * as api from './urls.js';
import {Redirect} from 'react-router-dom';

export class SearchRecipients extends React.Component{


  render(){
    let title = <div>Find Donation Recipients</div>
    let body = 
      <div>
        <p>Search for donation avenues shared by other users. Coming soon.</p>
      </div>

    let footer = 
      <div>
        <button type="button" className="btn btn-outline-primary" onClick={this.submitNewTax}>Submit</button>
        <button className="btn btn-outline-danger" onClick={this.props.app.hideModal}>Cancel</button>
      </div>

    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal} />
  }
}

export class PaymentSuccess extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.goTo=this.goTo.bind(this)
    this.edit=this.edit.bind(this)
  }

  edit(){
    let modal = 
      <PaymentEdit 
        payment={this.props.payment}
        app={this.props.app}
        profile={this.props.profile}
        recipients={this.props.recipients}
      />

    this.props.app.setModal(modal)
  }

  goTo(event){
    this.setState({redirect:event.target.name},this.props.app.hideModal)
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect} />;

    let payment=this.props.payment
    let prevBalance = this.props.stats.summary.balance

    let title = <div>Payment saved</div>
    let body =
      <div>
        <p>Donation saved to profile.</p>
        <p>Paid: {displayCurrency(payment.amount, this.props.profile)}</p>
        <p>Balance remaining: {displayCurrency(prevBalance-payment.amount, this.props.profile)}</p>
      </div>
    let footer = 
      <div>
        <button name={api.NAV_PAYMENT} className="btn btn-outline-info m-2" onClick={this.goTo}>New payment</button>
        <button name={api.NAV_DASHBOARD} className="btn btn-outline-info m-2" onClick={this.goTo}>My Dashboard</button>
        <button name="edit" className="btn btn-outline-info m-2" onClick={this.edit}>Edit/Clone</button>
      </div>

    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal} />
  }
}

export class PaymentView extends React.Component{
  constructor(props){
    super(props)

    let defaultAmount = this.props.stats.summary ? this.props.stats.summary.balance : 0

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
        app={this.props.app}
        returnId={this.setNewRecipient}
      />
    this.props.app.setModal(modal)
  }

  searchRecipients(event){
    event.preventDefault()
    let modal = 
      <SearchRecipients 
        hideModal={this.props.app.hideModal}
      />
    this.props.app.setModal(modal)
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

    apiFetch({
      url:api.MY_PAYMENTS,
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
        stats={this.props.stats}
        app={this.props.app}
      />

    this.props.app.setModal(modal)
    this.props.app.refresh()
    this.setState({redirect:api.NAV_HOME})
  }

  handlePostFailure(){
    this.setState({errorMessage:"Unable to save payment to profile."})
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect} />;

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
      <div>
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