import React from 'react';

const MAX_PASSWORD_LEN = 30
const MAX_EMAIL_LEN = 30
const MAX_NAME_LEN = 30

export class RegistrationForm extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      password_check: "__",
      email: "",
      errorMessage:"",
      strongPassword: false,
      location: "",
      date_of_birth: "",
    }

    this.handleSubmit=this.handleSubmit.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.createUser=this.createUser.bind(this)
    this.checkPasswordStrength=this.checkPasswordStrength.bind(this)
    this.createProfile=this.createProfile.bind(this)
  }

  checkPasswordStrength(password){
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\?!@#\$%\^&\*])(?=.{8,})") 
    this.setState({strongPassword:strongRegex.test(password)})
  }

  validateUserData(){
    this.setState({errorMessage:""})

    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.setState({errorMessage:"Fill in required fields."})
      return
    }

    // Validate password
    if(this.state.password != this.state.password_check){
      this.setState({errorMessage:"Passwords don't match."})
      return
    }

    if(!this.state.strongPassword){
      this.setState({errorMessage:"Password must be 8-30 characters, including a number and special character (?!@#$%^&)"})
      return
    }
    


    // Validate username
    let data = {username:this.state.username}
    fetch('/account/check-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
        console.log(json)
        if(json.unique==="false"){
          this.setState({errorMessage:"Username is already in use."})
        } else {
          this.createUser()
        }
      })
      .catch(e => {
        console.log(e.message)
      });
  }


  createUser(){

    let userData = {
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
    }


    fetch('/account/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
        console.log(json)
        let loginData = {username: userData.username, password: userData.password}
        this.props.login(loginData)
      })
      .then(()=>{
        this.createProfile()
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==="400"){
          this.setState({errorMessage:"Error processing registration, check email address."})
        } else {
          this.setState({errorMessage:"Error processing registration."})
        }
      });
  }
  
  createProfile(){
    let profileData = {
      location: this.state.location,
      date_of_birth: this.state.date_of_birth,
    }


    fetch('/account/profile/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
      body: JSON.stringify(profileData)
    })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        throw new Error(res.status)
      }
    })
    .then(json => {
      console.log(json)
    })
    .catch(e => {
      console.log(e.message)
    })
  }

  handleSubmit(e){
    e.preventDefault()
    this.validateUserData()
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})

    if(event.target.name==="password"){
      this.checkPasswordStrength(event.target.value)
    }
  }

  render(){
    let error
    if(this.state.errorMessage){
      error = <p>{this.state.errorMessage}</p>
    }

    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          {error}
          <input
            type="text"
            name="firstName"
            onChange={this.handleChange}
            placeHolder="First name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="lastName"
            onChange={this.handleChange}
            placeHolder="Last name"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="text"
            name="username"
            onChange={this.handleChange}
            placeHolder="Username"
          />
          <br/>
          <input
            type="password"
            name="password"
            onChange={this.handleChange}
            placeHolder="Password"
            maxLength={MAX_PASSWORD_LEN}
          />
          <br/>
          <input
            type="password"
            name="password_check"
            onChange={this.handleChange}
            placeHolder="Confirm Password"
          />
          <input
            type="text"
            name="email"
            onChange={this.handleChange}
            placeHolder="Email"
            maxLength={MAX_EMAIL_LEN}
          />
          <input
            type="text"
            name="location"
            onChange={this.handleChange}
            placeHolder="Location"
            maxLength={MAX_NAME_LEN}
          />
          <input
            type="date"
            name="date_of_birth"
            onChange={this.handleChange}
            placeHolder="Date of Birth"
          />
          <br/>
          <button type="submit" className="btn-outline-primary">Create</button>
        </form>
        <button name="hideRegistration" className="btn-outline-danger" onClick={this.props.onClick}>Cancel</button>
      </div>
    )
  }
}