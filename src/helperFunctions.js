import {refreshToken}  from './myJWT.js';



/*
export function validateEmail(email){
  let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
  return emailRegex.test(email)
}
*/

export function convertCurrency({convertFrom, convertTo, amount, onSuccess, onFailure}){
  let url = "http://data.fixer.io/api/latest"
  const FIXER_API_KEY = process.env.REACT_APP_FIXER_API_KEY
  url += `?access_key=${FIXER_API_KEY}`
  url += `&base=EUR&symbols=${convertFrom}`

  fetch(url)
  .then(res => {
      return res.json()
    })
    .then(json => {
      let amountEUR=amount/json.rates[convertFrom]
      conversionStepTwo({
        convertFrom:"EUR",
        convertTo:convertTo,
        amount:amountEUR,
        onSuccess:onSuccess, 
        onFailure:onFailure,
      })  
    })
    .catch(e => {
      console.log(e.message)
      if(onFailure){
        onFailure(e.message)
      }
    });
}

function conversionStepTwo({convertFrom, convertTo, amount, onSuccess, onFailure}){
  let url = "http://data.fixer.io/api/latest"
  const FIXER_API_KEY = process.env.REACT_APP_FIXER_API_KEY
  url += `?access_key=${FIXER_API_KEY}`
  url += `&base=EUR&symbols=${convertTo}`

  fetch(url)
  .then(res => {
      return res.json()
    })
    .then(json => {
      onSuccess(json.rates[convertTo]*amount)
    })
    .catch(e => {
      console.log(e.message)
      if(onFailure){
        onFailure(e.message)
      }
    });
}


export function createObject({data, url, onSuccess, onFailure}){
 
    console.log('Create new object:')
    console.log(data)
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer "+localStorage.getItem('access')
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
        if(onSuccess){
          onSuccess()
        }
      })
      .catch(e => {
        console.log(e.message)
        if(e.message==='401'){
          refreshToken({
            onSuccess:createObject, 
            success_args:[{
              data:data, 
              url:url, 
              onSuccess:onSuccess,
              onFailure:onFailure,
            }]
          })
        } else if(onFailure){
          onFailure(e.message)
        }
      });
}

export function editObject({data, url, onSuccess, onFailure}){

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer "+localStorage.getItem('access')
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
    if(onSuccess){
      onSuccess()
    }
  })
  .catch(error => {
    console.log(error.message)
    if(error.message==='401'){
      refreshToken({
        onSuccess:editObject,
        success_args:[{
          data:data,
          url:url,
          onSuccess:onSuccess,
          onFailure:onFailure,
        }]
      })
    } else if(onFailure){
      onFailure(error.message)
    }
  });
}

export function fetchObject({method, data, url, onSuccess, onFailure, noAuth}){

  // SET HEADERS - No authorisation required for some APIs
  let headers 
  if(noAuth){
    headers = {
      'Content-Type': 'application/json',
    }
  } else {
    headers = {
      'Content-Type': 'application/json',
      Authorization: "Bearer "+localStorage.getItem('access'),
    }
  }

  if(!method){
    let method='GET'
  }

  // SET BODY - No body required for GET
  let fetchData
  if(data){
    fetchData = {
      method: method,
      headers: headers,
      body: JSON.stringify(data),
    }
  } else {
    fetchData = {
      method: method,
      headers: headers,
    }
  }


  fetch(url, fetchData)
  .then(res => {
    //console.log(res)
    if(res.ok){
      if(res.status===204){
        //console.log("204 no data")
        onSuccess(res)
        return;
      }
      return res.json();
    } else {
      throw new Error(res.status)
    }
  })
  .then(json => {
    //console.log(json)
    if(onSuccess){
      onSuccess(json)
    }
  })
  .catch(error => {
    console.log(error.message)
    if(error.message==='401'){
      refreshToken({
        onSuccess:fetchObject,
        success_args:[{
          method:method,
          data:data,
          url:url,
          onSuccess:onSuccess,
          onFailure:onFailure,
        }]
      })
    } else if(onFailure){
      onFailure(error)
    }
  });
}
