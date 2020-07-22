import React from 'react';
import {Navbar, Modal} from 'react-bootstrap';
import {ObjectSelectionList} from './reactComponents.js';
import {CreateRecipient} from './objectCreate.js';

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

    this.state = {

    }

    this.changeAmount=this.changeAmount.bind(this)
    this.addRecipient=this.addRecipient.bind(this)
    this.searchRecipients=this.searchRecipients.bind(this)
  }

  componentDidMount(){
    if(this.props.recipients){
      console.log(this.props.recipients.length)
    }
  }

  changeAmount(event){
    event.preventDefault()
    this.setState({[event.target.name]: event.target.value/this.props.profile.conversion_factor})
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


  render(){

    let summary, sym, conversion
    let balance = "$0.00"
    if(this.props.stats && this.props.profile){
      summary = this.props.stats.summary
      if(summary){
        conversion = this.props.profile.conversion_factor
        sym = this.props.profile.currency_symbol
        balance = parseFloat(conversion*(summary.total_tax-summary.total_paid)).toFixed(2)
        
      }
    }

    let userRecipientSelection
    if(this.props.recipients.length > 0){
      userRecipientSelection = 
        <label>
          My donation recipient:
           <ObjectSelectionList name="recipient" onChange={this.handleChange} list={this.props.recipients} value="id" label="name"/>
        </label>
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
        <p>Outstanding balance: {sym}{balance}</p>
        <p>Nothing to see here</p>
        <form>
          <label>
            Amount: {sym}
            <input type="number" name="amount" className="m-2" defaultValue={balance} onChange={this.changeAmount}/>
          </label>
          <br/>
          {userRecipientSelection}
          <button className="btn btn-outline-info m-2" onClick={this.addRecipient} >+ New</button>
          <button className="btn btn-outline-info m-2" onClick={this.searchRecipients}>Search</button>
          <br/>
          <button className="btn btn-success m-2" onClick={this.makePayment}>Record payment</button>
        </form> 
      </div>
    )
  }
}