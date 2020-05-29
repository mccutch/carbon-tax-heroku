export function fetchObject(url, returnFetch, returnObject){
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer "+localStorage.getItem('access')
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
    returnFetch(returnObject)
  })
  .catch(e => {
    console.log(e.message)
    if(e.message==='401'){
      refreshToken({onSuccess:fetchObject(url,)})
    }
  });
}