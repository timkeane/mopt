import App from './App'
import soda from './soda'
import Dialog from 'nyc-lib/nyc/Dialog'
import fetchTimeout from './fetchTimeout'

fetchTimeout(soda.EVICTION.url).then(response => {
  if (!response.ok) {
    throw Error(response.statusText)
  }
  response.json().then(json => {
    new App(json)
  })
}).catch(err => {
  $('body').removeClass('loading')
  new Dialog().ok({message: `Unable to load <strong>${soda.EVICTION.name}</strong> from NYC OpenData`})
})
