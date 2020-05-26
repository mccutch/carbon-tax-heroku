/*
Implementation using simplejwt on Django server
*/

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
  if(onSuccess){
    onSuccess()
  }
}

export function refreshToken({onSuccess, success_args, onFailure}){
  /*
  Attempt to refresh the access token, then execute onSuccess (retry request) with success_args.
  If refresh fails, execute onFailure (go to login screen).
  Input parameters as an object.
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
      if(res.ok){
        return res.json()
      } else {
        throw new Error(res.status);
      }
      
    })
    .then(json => {
      //console.log(json.access)
      localStorage.setItem('access', json.access)
      console.log(json)
      if(onSuccess){
        if(success_args){
          // This is untested!! Waiting for a request with args.
          console.log("Args provided.")
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
      if(onFailure){
        onFailure()
      } else{
        console.log("No onFailure provided")
      }
    });

}

