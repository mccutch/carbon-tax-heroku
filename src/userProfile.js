import React from 'react';
import {refreshToken} from './myJWT.js';


export class ProfileDisplay extends React.Component{
  constructor(props){
    super(props)

    this.state={
      profile:{}
    }

    this.fetchUserProfile=this.fetchUserProfile.bind(this)
  }

  fetchUserProfile(){
    fetch('/account/profile/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
      },
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
        this.setState({
          profile:json
        })
      })
      .catch(error => {
        console.log(error.message)
        if(error.message==='401'){
          refreshToken({onSuccess:this.fetchUserProfile})
        }
      });

  }

  componentDidMount(){
    this.fetchUserProfile()
  }

  render(){
    let user=this.props.user
    let profile=this.state.profile
    return(
      <div>
        <h3>{this.state.username}</h3>
        <p>{user.first_name} {user.last_name}</p>
        <p>Location: {profile.location}</p>
        <p>Date of Birth: {profile.date_of_birth}</p>
        <button name="hideProfile" className="btn-outline-danger" onClick={this.props.onClick}>Cancel</button>
      </div>
    )
  }
}