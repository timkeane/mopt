import App from './App'
import soda from './soda'
import Dialog from 'nyc-lib/nyc/Dialog'

fetch(soda.EVICTION.url).then(response => {
  response.json().then(json => {
    new App(json)
  })
}).catch(err => {
  new Dialog().ok({message: `Unable to load ${soda.EVICTION.name} from NYC OpenData`})
})

