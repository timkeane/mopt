const TIMEOUT = 15000

export default (url, timeout) => {
  let didTimeOut = false
  return new Promise((resolve, reject) => {
    const timeOut = setTimeout(() => {
      didTimeOut = true
      reject(new Error(`Request timeout for ${url}`))
    }, timeout || TIMEOUT)
    fetch(url).then(response => {
      clearTimeout(timeout)
      if(!didTimeOut) {
        resolve(response)
      }
    }).catch(err => {
      if(didTimeOut) return
      reject(err)
    })
  })
}