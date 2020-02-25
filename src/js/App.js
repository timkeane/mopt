/**
 * @module App
 */

import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import Source from 'ol/source/Vector'
import GeoJson from 'ol/format/GeoJSON'
import decorations from './decorations'
import facilityStyle from './facility-style'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import soda from './soda'

class App extends FinderApp {
  constructor(zips) {
    super({
      title: 'Evictions',
      splashOptions: {
        message: 'mopt'
      },
      facilityUrl: 'data/zip.json',
      facilityFormat: new GeoJson({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }),
      facilityTabTitle: 'List',
      facilityStyle: facilityStyle.style(),
      decorations: [decorations],
      geoclientUrl: 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
    })
    this.zips = zips
    this.minMax(zips)
    this.adjustPager()
    this.addChoices()
    this.zoomFull()
    this.legend()
  }
  addChoices() {
    const select = $('<select class="btn btn-rad-all dataset"></select>')
      .change($.proxy(this.choose, this))
    Object.keys(soda).forEach(key => {
      select.append(`<option value="${key}">${soda[key].name}</option>`)
    })
    $('#facilities').prepend(select)
  }
  legend() {
    $('div.legend').remove()
    $(this.map.getTargetElement()).append(facilityStyle.legend(this.min, this.max))
  }
  adjustPager() {
    this.sorted = {Name: false, Count: true}
    this.pager.pageSize = 50
    this.pager.list = $('<tbody></tbody>')
    $(App.LIST_HTML).append(this.pager.list).insertBefore($('div.list'))
    this.pager.render = (items) => {
      items.forEach(item => {
        this.pager.list.append(item.row())
      })
    }
    $('div.list').remove()
  }
  zoomFull() {
    this.view.fit(Basemap.EXTENT, {
      size: this.map.getSize(),
      duration: 500
    })
  }
  sort(prop) {
    const features = this.source.getFeatures()
    this.sorted[prop] = !this.sorted[prop]
    features.sort((f0, f1) => {
      const a = f0[`get${prop}`]()
      const b = f1[`get${prop}`]()
      if (a < b) {
        return this.sorted[prop] ? -1 : 1
      } else if (a > b) {
        return this.sorted[prop] ? 1 : -1
      }
      return 0
    })
    this.pager.reset(features)
    return features
  }
  choose(event) {
    const url = soda[event.target.value].url
    $('table.list span.dataset').html(soda[event.target.value].name)
    fetch(url).then(response => {
      response.json().then(json => {
        this.zips = json
        this.minMax(this.zips)
        this.legend(this.min, this.max)
        this.layer.setSource(new Source())
        this.layer.setSource(this.source)
        this.zoomFull()
        this.sorted = {Name: false, Count: true}
        this.sort('Count')
      })
    }).catch(err => {
      new Dialog().ok({message: `Unable to load ${soda.EVICTION.name} from NYC OpenData`})
    })
    
  }
  ready(features) {
    this.layer.setOpacity(.5)
    super.ready(this.sort('Count'))
  }
  minMax(zips) {
    const counts = []
    zips.forEach(zip => {
      counts.push(zip.count * 1)
    })
    counts.sort((a, b) => {
      if (a < b) {
        return -1
      } else if (a > b) {
        return 1
      }
      return 0
    })    
    this.min = counts[0]
    this.max = counts[counts.length - 1]
  }
}

App.LIST_HTML = `<table class="list">
  <thead>
    <tr>
      <td onclick="finderApp.sort(\'Name\')">ZIP Code <span>&#x21F5;</span></td>
      <td onclick="finderApp.sort(\'Count\')"><span class="dataset">Evictions</span> <span>&#x21F5;</span></td>
    <tr>
  </thead>
  </table>`

export default App