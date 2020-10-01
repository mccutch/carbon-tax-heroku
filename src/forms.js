import React from 'react';
import {FormRow, LabelledInput, ObjectSelectionList } from './reactComponents.js';
import { MAX_LEN_RECIP_NAME, MAX_LEN_RECIP_COUNTRY, MAX_LEN_RECIP_WEB_LINK, MAX_LEN_RECIP_DONATION_LINK, MAX_LEN_RECIP_DESCRIPTION, MAX_LEN_NAME} from './constants.js';
import {taxCategories} from './defaultTaxTypes.js';
import * as units from './unitConversions.js';


export class VehicleForm extends React.Component{
  render(){
    let name, economy, fuelId
    if(this.props.vehicle){
      name=this.props.vehicle.name
      economy=parseFloat(units.convert(this.props.vehicle.economy, this.props.displayUnits)).toFixed(1)
      fuelId=this.props.vehicle.fuel
    }
    return(
      <form>
        <p><strong>{this.props.errorMessage}</strong></p>
        <input name="name" type="text" placeholder="Vehicle name" defaultValue={name} onChange={this.props.onChange} className="form-control my-2"/>
        <LabelledInput
          input={<input name="economy" type="number" placeholder="Economy" defaultValue={economy} onChange={this.props.onChange} step="0.1" className="form-control"/>}
          append={units.string(this.props.displayUnits)}
        />
        <ObjectSelectionList name="fuel" onChange={this.props.onChange} list={this.props.fuels} defaultValue={fuelId} label="name" value="id" />
      </form>
    )
  }
}

export class TaxForm extends React.Component{
  render(){
    let name, price_per_kg, category
    let categoryList = <ObjectSelectionList defaultValue={category} name="category" list={taxCategories} onChange={this.props.onChange} label="title" value="title" />
    if(this.props.tax){
      name=this.props.tax.name
      price_per_kg=parseFloat(this.props.tax.price_per_kg*this.props.profile.conversion_factor).toFixed(3)
      category=this.props.tax.category
      categoryList = this.props.tax.isDefault ? "" : categoryList
    }
      
    return(
      <form>
        <input defaultValue={name} type="text" name="name" maxLength={MAX_LEN_NAME} onChange={this.props.onChange} className="form-control my-2" placeholder="Name"/>
        <LabelledInput
          input={<input defaultValue={price_per_kg} type="number" name="price_per_kg" onChange={this.props.onChange} className="form-control" placeholder="Price" step="0.01"/>}
          append={`${this.props.profile.currency_symbol}/kg CO2`}
        />
        {categoryList}
        <p><strong>{this.props.errorMessage}</strong></p>
      </form>
    )
  }
}

export class RecipientForm extends React.Component{
  render(){
    let name, country, website, donation_link, description
    if(this.props.recipient){
      name=this.props.recipient.name
      country=this.props.recipient.country
      website=this.props.recipient.website
      donation_link=this.props.recipient.donation_link
      description=this.props.recipient.description
    }
    return(
      <form>
        <FormRow
            label={<div>Name:</div>}
            labelWidth={3}
            input={<input defaultValue={name} type="text" name="name" placeholder="Required" maxLength={MAX_LEN_RECIP_NAME} className="form-control my-2" onChange={this.props.onChange}/>}
        />
        <FormRow
          label={<div>Country:</div>}
          labelWidth={3}
          input={<input defaultValue={country} type="text" name="country" placeholder="Country" maxLength={MAX_LEN_RECIP_COUNTRY} className="form-control my-2" onChange={this.props.onChange}/>}
        />
        <FormRow
          label={<div>Website:</div>}
          labelWidth={3}
          input={<input defaultValue={website} type="text" name="website" placeholder="Website url" maxLength={MAX_LEN_RECIP_WEB_LINK} className="form-control my-2" onChange={this.props.onChange}/>} 
        /> 
        <FormRow
          label={<div>Donation:</div>}
          labelWidth={3}
          input={<input defaultValue={donation_link} type="text" name="donation_link" placeholder="Donation page url" maxLength={MAX_LEN_RECIP_DONATION_LINK} className="form-control my-2" onChange={this.props.onChange}/>}
        />
        <label>
          Description:
        </label>
        <br/>
        <textarea defaultValue={description} type="area" name="description" maxLength={MAX_LEN_RECIP_DESCRIPTION} className="form-control my-2" onChange={this.props.onChange} rows="6"/> 
        <p><strong>{this.props.errorMessage}</strong></p>
      </form>
    )
  }
}
