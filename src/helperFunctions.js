import {refreshToken}  from './myJWT.js';


export function validateEmail(email){
  let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
  return emailRegex.test(email)
}




export function createObject({data, url, onSuccess}){
 
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
          }]
        })
        }
      });



}
