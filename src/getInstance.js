import React from 'react';


export function getInstance(url){
  let returnObject=null;

  fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
        if(res.ok){
          return res.json();
        } else {
          throw new Error(res.status)
        }
      })
      .then(json => {
        returnObject=json
      })
      .catch(e => {
        console.log(e)
      });

  return returnObject
}
