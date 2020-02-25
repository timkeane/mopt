import App from './App'

fetch('https://data.cityofnewyork.us/resource/6z8x-wfk4.json?$select=eviction_zip%20as%20zip,%20count(eviction_zip)%20as%20count&$group=eviction_zip').then(response => {
  response.json().then(soda => {
    new App(soda)
  })
})

