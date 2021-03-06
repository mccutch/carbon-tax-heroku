import React from 'react';
import {Badge} from 'react-bootstrap';
import * as urls from './urls.js';
import * as units from './unitConversions.js';
import {decodeEmissionFormat, getAttribute, displayCurrency} from './helperFunctions.js';
import {EmissionEdit, TaxEdit, VehicleEdit, PaymentEdit, RecipientEdit} from './objectEdit.js';



class ObjectDisplayView extends React.Component{

  render(){
    let icon = 
      <div className="col-2" style={{height:"2.5rem"}}>
        <img
          alt={""}
          src={this.props.iconSrc ? this.props.iconSrc : urls.CO2_ICON}
          height="110%"
          style={{margin: "0px 0px 0px -0.5rem"}}
        />
      </div>

    return(
      <button className="btn btn-outline-primary btn-block my-1" onClick={this.props.onClick}>
        <div className="row" style={{height:"2.5rem"}}>
          {icon}
          <div className="col-10">
              <div className="row">
                <div className="col text-truncate text-left"  style={{margin: "0rem 0rem 0rem -0.25rem"}}>
                  <strong>{this.props.primaryText}</strong>
                </div>
                <div className="col-auto text-center">
                  <strong>{this.props.primaryRight}</strong>
                </div>
              </div>
              <div className="row" style={{height:"1rem"}}>
                <div className="col text-truncate text-left"  style={{margin: "-0.5rem 0rem 0rem -0.25rem"}}>
                  <small>{this.props.secondaryText}</small>
                </div>
                <div className="col-auto text-center" style={{margin: "-0.5rem 0rem 0rem 0rem"}}>
                      <small>{this.props.secondaryRight}</small>           
                </div>
              </div>
          </div>
        </div>
      </button>
    )
  }
}

export class EmissionDisplayView extends React.Component{
  render(){
    let emission=this.props.emission
    let format = decodeEmissionFormat(emission.format_encoding)
    //let sym = this.props.profile.currency_symbol
    let taxName = getAttribute({objectList:this.props.taxes, key:"id", keyValue:emission.tax_type, attribute:"name"})
    return (
      <ObjectDisplayView
        primaryText={emission.name}
        secondaryText={`${emission.date} - ${taxName}`}
        primaryRight={`${displayCurrency(emission.price, this.props.profile)}`}
        secondaryRight={`${parseFloat(emission.co2_output_kg).toFixed(0)}kg CO2`}
        iconSrc={format==="road" ? urls.CAR_ICON : (format==="airDistance" ? urls.AIRLINER_ICON : urls.HELICOPTER_ICON)}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.setModal(
            <EmissionEdit
              emission={this.props.emission} 
              displayUnits={this.props.displayUnits} 
              profile={this.props.profile} 
              taxes={this.props.taxes} 
              hideModal={this.props.hideModal} 
              refresh={this.props.refresh}
              fuels={this.props.fuels}
            />
          )}
        }
      />
    )
  }
}

export class TaxDisplayView extends React.Component{
  render(){
    let tax=this.props.tax
    let sym = this.props.profile.currency_symbol
    return (
      <ObjectDisplayView
        primaryText={tax.name}
        secondaryText={`${tax.category}`}
        primaryRight={`${displayCurrency(tax.price_per_kg, this.props.profile, 3)}`}
        secondaryRight={`per kg CO2`}
        iconSrc={tax.category==="Driving" ? urls.CAR_ICON : (tax.category==="Flying" ? urls.AIRLINER_ICON : urls.CO2_ICON)}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.setModal(
            <TaxEdit
              tax={this.props.tax}
              taxes={this.props.taxes}
              profile={this.props.profile}
              hideModal={this.props.hideModal} 
              setModal={this.props.setModal}
              refresh={this.props.refresh}
            />
          )}
        }
      />
    )
  }
}

export class VehicleDisplayView extends React.Component{
  render(){
    let vehicle=this.props.vehicle
    let fuelName=getAttribute({objectList:this.props.fuels, key:"id", keyValue:vehicle.fuel, attribute:"name"})
    return (
      <ObjectDisplayView
        primaryText={vehicle.name}
        secondaryText={`${fuelName}`}
        primaryRight={`${parseFloat(units.convert(vehicle.economy, this.props.displayUnits)).toFixed(1)}`}
        secondaryRight={`${units.string(this.props.displayUnits)}`}
        iconSrc={fuelName==="Petrol" ? urls.CAR_ICON : (fuelName==="Diesel" ? urls.PICKUP_ICON : urls.CO2_ICON)}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.setModal(
            <VehicleEdit
              vehicle={this.props.vehicle}
              displayUnits={this.props.displayUnits}
              fuels={this.props.fuels}
              hideModal={this.props.hideModal} 
              refresh={this.props.refresh}
            />
          )}
        }
      />
    )
  }
}

export class PaymentDisplayView extends React.Component{
  render(){
    let payment=this.props.payment
    return (
      <ObjectDisplayView
        primaryText={`${getAttribute({objectList:this.props.recipients, key:"id", keyValue:payment.recipient, attribute:"name"})}`}
        secondaryText={`${payment.date}`}
        primaryRight={`${displayCurrency(payment.amount, this.props.profile)}`}
        secondaryRight={` `}
        iconSrc={urls.GREEN_TEA_ICON}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.setModal(
            <PaymentEdit
              payment={this.props.payment}
              profile={this.props.profile}
              hideModal={this.props.hideModal} 
              refresh={this.props.refresh}
              recipients={this.props.recipients}
            />
          )}
        }
      />
    )
  }
}


export class ProfileDisplayView extends React.Component{
  render(){
    let profile=this.props.profile
    let user=this.props.user
    let taxTotal = this.props.stats ? this.props.stats.summary.total_paid : 0
    let co2Total = this.props.stats ? this.props.stats.summary.total_co2 : 0
    return (
      <ObjectDisplayView
        primaryText={`${user.username}`}
        secondaryText={`${user.first_name} ${user.last_name}`}
        primaryRight={`Paid: ${displayCurrency(taxTotal, profile)}`}
        secondaryRight={`CO2: ${parseFloat(co2Total).toFixed(0)}kg`}
        iconSrc={urls.BEAR_ICON}
        onClick={this.props.onClick}
      />
    )
  }
}

export class RecipientDisplayView extends React.Component{
  render(){
    let recipient=this.props.recipient
    return (
      <ObjectDisplayView
        primaryText={`${recipient.name}`}
        secondaryText={`${recipient.country ? recipient.country : ""}`}
        primaryRight={recipient.website ? <Badge pill variant="warning"><a href={recipient.website} target="_blank" onClick={(e)=>{e.stopPropagation()}}>Website</a></Badge> : ""}
        //secondaryRight={recipient.donation_link ? <Badge variant="danger"><a href={recipient.donation_link} target="_blank">Donate</a></Badge> : ""}
        iconSrc={urls.PIGGY_ICON}
        onClick={this.props.onClick}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.setModal(
            <RecipientEdit
              recipient={this.props.recipient}
              //profile={this.props.profile}
              refresh={this.props.refresh}
              setModal={this.props.setModal}
              hideModal={this.props.hideModal}
            />
          )}
        }
      />
    )
  }
}


