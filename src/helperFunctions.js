import {refreshToken}  from './myJWT.js';
import {emissionSaveFormats, heliEmissions} from './constants.js';


const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

//----------------------------------------------------------------------------------------------------------------------------
/*
getAttribute(objectList, id, attribute)

convertCurrency({convertFrom, convertTo, amount, onSuccess, onFailure})

createObject({data, url, onSuccess, onFailure})
editObject({data, url, onSuccess, onFailure})
fetchObject({method, data, url, onSuccess, onFailure, noAuth})


*/
//----------------------------------------------------------------------------------------------------------------------------
export function sortByKey({list, key, ascending=true}){
  return list.sort(function(a, b)
  {
    let x = a[key]; var y = b[key];
    let dir = ascending ? 1 : -1
    return ((x < y) ? -dir : ((x > y) ? dir : 0));
  });
}

export function importGoogleLibraries(callback){
  if(!window.google){
    console.log("Generating Google API script.")
    var script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry&callback=${callback}`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
  }
}


export function getHeliEconomy(seats){
  if(seats<=4){
    return heliEmissions.seat4
  }else if(seats===5){
    return heliEmissions.seat5
  }else if(seats===6){
    return heliEmissions.seat6
  }else if(seats<=12){
    return heliEmissions.seat12
  }else if(seats<=14){
    return heliEmissions.seat14
  } else {
    return heliEmissions.seat14+(seats-14)*100
  }
}

export function decodeEmissionFormat(code){
  try{
    return(emissionSaveFormats[code])
  } catch{
    return null
  }
}

export function encodeEmissionFormat(name){
  for(let i in emissionSaveFormats){
    if(emissionSaveFormats[i]===name){
      return parseInt(i)
    }
  }
  return null
}

export function displayHrs(decimalHrs){
  let returnString = `${Math.floor(decimalHrs)}h`
  let minutes = Math.round((decimalHrs%1)*60)
  if(minutes!==0){
    returnString += `${minutes}m`
  }
  return(returnString)
}

export function sleep(milliseconds){
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function displayCurrency(value, profile){
  return `${profile.currency_symbol}${parseFloat(value*profile.conversion_factor).toFixed(2)}`
}

export function truncate(str, maxLen){
  if(str.length > maxLen){
    return str.substring(0,maxLen)
  } else {
    return str
  }
}

export function getObject({objectList, key, keyValue}){
  if(!keyValue) return null
  for(let i in objectList){
    if(!objectList[i][key]){return null}
    if(objectList[i][key]===keyValue){
      return objectList[i]
    }
  }
  console.log(`Unable to find ${key}=${keyValue} in list.`)
  return null
}

export function getAttribute({objectList, key, keyValue, attribute}){
  let object =  getObject({
                  objectList:objectList,
                  key:key,
                  keyValue:keyValue
                })
  if(object){
    try{ 
      return object[attribute]
    }
    catch{
      console.log(`Unable to find ${attribute} value for ${key}=${keyValue}.`)
      return null
    }
  }
  return null
}

export function getCurrencyFactor({currency,onSuccess}){
  convertCurrency({
    convertFrom:"AUD",
    convertTo:currency,
    amount:1,
    onSuccess:onSuccess,
  })
}

export function convertCurrency({convertFrom, convertTo, amount, onSuccess, onFailure}){
  const CURRENCY_API_KEY = process.env.REACT_APP_CURRENCY_API
  let url = `https://free.currconv.com/api/v7/convert?q=${convertFrom}_${convertTo}&compact=ultra&apiKey=${CURRENCY_API_KEY}`
  
  fetch(url)
  .then(res => {
      console.log(res)
      return res.json()
    })
    .then(json => {
      console.log(json)
      console.log(json[`${convertFrom}_${convertTo}`])
      onSuccess(json[`${convertFrom}_${convertTo}`])
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

function deleteFromCache(cacheName, resource){
  caches.open(cacheName).then(function(cache) {
    cache.delete(resource).then(function(response) {
      console.log(`${resource} deleted from ${cacheName}:${response}`)
      return;
    });
  })
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
        deleteFromCache('user-dynamic','url').then(function (){
          onSuccess(res);
          return
        })
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


