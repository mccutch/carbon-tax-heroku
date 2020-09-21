/*
Implementation using simplejwt on Django server
*/

import {USER_CACHE} from './constants.js';

export function getToken({data, onSuccess, onFailure}){
  /*
  Get access and refresh jwt tokens from the backend server. 
  Store these in localStorage.
  Input:
  data = {
    username: "username",
    password: "password",
  }
  */    

  fetch('/api/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        throw new Error(res.status);
      }
    })
    .then(json => {
      //console.log(json.access)
      //console.log(json.refresh)
      localStorage.setItem('access', json.access)
      localStorage.setItem('refresh', json.refresh)
      if(onSuccess){
        onSuccess()
      }
      
    })
    .catch(e => {
      console.log(e)
      clearToken({})
      if(onFailure){
        onFailure()
      }
    });
}

export function clearToken({onSuccess, }){
  localStorage.setItem('access', '')
  localStorage.setItem('refresh', '')
  caches.delete(USER_CACHE).then(function(found){
    console.log(`Cache deleted, found :${found}`)
    if(onSuccess){
      onSuccess()
    }
  })

  
}

export function refreshToken({onSuccess, success_args, onFailure, failure_args}){
  /*
  Attempt to refresh the access token, then execute onSuccess (retry request) with success_args.
  If refresh fails, execute onFailure (go to login screen).
  Supply parameters as an object, where onSuccess and onFailure are methods, and the arguments are provided as a list.

  Example:
  refreshToken({onSuccess:this.fetchObject, success_args:[url,objectName]})
  */
  console.log("Refreshing token...")
  let data = {}
  try {
    data = {
      refresh:localStorage.getItem('refresh')
    }
  } catch {
    console.log("No refresh token in localStorage")
    return
  }

  fetch('/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      console.log(res)
      if(res.ok){
        return res.json()
      } else {
        throw new Error(res.status);
      }
      
    })
    .then(json => {
      console.log(json)
      //console.log(json.access)
      localStorage.setItem('access', json.access)
      
      if(onSuccess){
        if(success_args){
          //console.log("Success args provided.")
          //console.log(success_args)
          onSuccess.apply(this, success_args)

        } else {
          onSuccess()
        }
      } else {
        console.log("No onSuccess provided")
      }  
    })
    .catch(error => {
      console.log(error)
      if(error.message==="500"){
        return
      }
      //clearToken({onSuccess:onFailure})
      if(onFailure){
        if(failure_args){
          console.log("Failure args provided.")
          onFailure.apply(this, failure_args)
        } else {
          onFailure()
        }
      } else{
        console.log("No onFailure provided")
      }
    });

}

