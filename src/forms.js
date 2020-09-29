import React from 'react';
import {FormRow} from './reactComponents.js';
import { MAX_LEN_RECIP_NAME, MAX_LEN_RECIP_COUNTRY, MAX_LEN_RECIP_WEB_LINK, MAX_LEN_RECIP_DONATION_LINK, MAX_LEN_RECIP_DESCRIPTION, MAX_LEN_NAME} from './constants.js';


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
