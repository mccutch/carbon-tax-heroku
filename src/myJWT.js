//Implementation using simplejwt on Django server
import {USER_CACHE} from './constants.js';
import {apiFetch} from './helperFunctions.js';
import * as api from './urls.js';

export function getToken({data, onSuccess, onFailure}){
  apiFetch({
    url:api.GET_TOKEN,
    method:'POST',
    data:data,
    onSuccess:(json)=>{
      localStorage.setItem('access', json.access)
      localStorage.setItem('refresh', json.refresh)
      if(onSuccess){onSuccess()}
    },
    onFailure:(error)=>{
      console.log(error)
      clearToken({})
      if(onFailure){onFailure()}
    },
  })
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

export function refreshToken({onSuccess, onFailure}){
  console.log("Refreshing token...")
  let data = {}
  try {
    data = {refresh:localStorage.getItem('refresh')}
  } catch {
    console.log("No refresh token in localStorage")
    if(onFailure){onFailure()}
    return
  }

  apiFetch({
    url:api.REFRESH_TOKEN,
    method:'POST',
    data:data,
    onSuccess:(json)=>{
      console.log(json)
      localStorage.setItem('access', json.access)
      if(onSuccess){onSuccess()}
    },
    onFailure:(error)=>{
      console.log(`Refresh token error: ${error}`)
      clearToken({})
      if(onFailure){onFailure(error)}
    }
  })
}

