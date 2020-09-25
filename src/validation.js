import React from 'react';
import {MAX_LEN_USERNAME, MAX_LEN_PASSWORD, MAX_LEN_EMAIL} from './constants.js';
import {apiFetch} from './helperFunctions.js';
import * as api from './urls.js';

//export const PASSWORD_ERR_MESSAGE = "Password must be 8-30 characters, including a number and special character (?!@#$%^&)"
export const PASSWORD_ERR = "Password must be 8-30 characters, including a capital letter and a number."
export const PASSWORD_CHECK_ERR = "Passwords don't match."
export const USERNAME_ERR = "Username must 6-30 alphanumeric characters, starting with a letter."
export const EMAIL_ERR = "Invalid email address."


export function checkUniqueUser({username, email, onSuccess, onFailure}){
  apiFetch({
    method:'POST',
    url:api.CHECK_UNIQUE,
    data:{username:username, email:email},
    onSuccess:onSuccess,
    onFailure:onFailure,
    noAuth:true,
  })
  return null
}

export function checkPasswordStrength(password){
  //const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*])(?=.{8,})") 
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
  return strongRegex.test(password)
}

export function validateEmailRegex(email){
  let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
  return emailRegex.test(email)
}

export function validateUsernameRegex(username){
  
  //const validUsername = new RegExp("^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$")Username can contain "." or "_" but only one at a time, and not at the ends of the string.
  const validUsername = new RegExp("^[a-zA-Z]\\w{4,28}[a-zA-Z0-9]$")//6-8 characters, starting with a letter, "_" allowed.
  return validUsername.test(username)
}

export class EmailInput extends React.Component{
  render(){
    return(
      <ValidatedInput
        type="email"
        name={this.props.name ? this.props.name : "email"}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        returnValidation={this.props.returnValidation}
        validate={validateEmailRegex}
        placeholder={this.props.placeholder ? this.props.placeholder : "Email"}
        maxLength={MAX_LEN_EMAIL}
        className={this.props.className}
        isValid={this.props.isValid}
        submitted={this.props.submitted}
        value={this.props.value}
        errorMessage={EMAIL_ERR}
      />
    )
  }
}

export class UsernameInput extends React.Component{
  render(){
    return(
      <ValidatedInput
        type="text"
        name={this.props.name ? this.props.name : "username"}
        onChange={this.props.onChange}
        returnValidation={this.props.returnValidation}
        validate={validateUsernameRegex}
        placeholder={this.props.placeholder ? this.props.placeholder : "Username"}
        maxLength={MAX_LEN_USERNAME}
        className={this.props.className}
        isValid={this.props.isValid}
        submitted={this.props.submitted}
        value={this.props.value}
        errorMessage={USERNAME_ERR}
      />
    )
  }
}

export class PasswordCheckInput extends React.Component{
  render(){
    return(
      <ValidatedInput
        type="password"
        name={this.props.name ? this.props.name : "password_check"}
        onChange={this.props.onChange}
        returnValidation={this.props.returnValidation}
        validate={(input)=>{return this.props.checkValue===input}}
        placeholder={this.props.placeholder ? this.props.placeholder : "Confirm Password"}
        maxLength={MAX_LEN_PASSWORD}
        className={this.props.className}
        isValid={this.props.isValid}
        submitted={this.props.submitted}
        value={this.props.value}
        errorMessage={PASSWORD_CHECK_ERR}
      />
    )
  }
}

export class PasswordInput extends React.Component{
  render(){
    return(
      <ValidatedInput
        type="password"
        name={this.props.name ? this.props.name : "password"}
        onChange={this.props.onChange}
        returnValidation={this.props.returnValidation}
        validate={checkPasswordStrength}
        placeholder={this.props.placeholder ? this.props.placeholder : "Password"}
        maxLength={MAX_LEN_PASSWORD}
        className={this.props.className}
        isValid={this.props.isValid}
        submitted={this.props.submitted}
        value={this.props.value}
        errorMessage={PASSWORD_ERR}
      />
    )
  }
}

class ValidatedInput extends React.Component{
  render(){
    return(
      <div>
        <input
          type={this.props.type}
          name={this.props.name}
          defaultValue={this.props.defaultValue}
          onChange={(e)=>{this.props.onChange(e); this.props.returnValidation(this.props.validate(e.target.value))}}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength}
          className={`form-control ${this.props.className} ${this.props.isValid ? "is-valid":""} ${this.props.submitted&&!this.props.isValid ? "is-invalid":""}`}
        />
        <small className={`${this.props.submitted ? "invalid-feedback":"form-text text-muted"}`}>
          {(this.props.value&&!this.props.isValid) ? `${this.props.errorMessage}`:""}
        </small>
      </div>
    )
  }
}