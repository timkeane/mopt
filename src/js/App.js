/**
 * @module App
 */

import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import GeoJson from 'ol/format/GeoJSON'
import decorations from './decorations'
import facilityStyle from './facility-style'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import ListPager from 'nyc-lib/nyc/ListPager'

class App extends FinderApp {
  constructor(zips) {
    const counts = []
    decorations.zips = zips
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
    decorations.min = counts[0]
    decorations.max = counts[counts.length - 1]
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
      facilityStyle: facilityStyle.style(decorations.min, decorations.max),
      decorations: [decorations],
      geoclientUrl: 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
    })
    this.adjustPager()
    this.zoomFull()
    this.legend(decorations.min, decorations.max)
  }
  legend(min, max) {
    $(this.map.getTargetElement()).append(facilityStyle.legend(min, max))
  }
  adjustPager() {
    this.sorted = {postalcode: false, count: true}
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
      const a = f0.get(prop)
      const b = f1.get(prop)
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
  ready(features) {
    this.layer.setOpacity(.5)
    super.ready(this.sort('count'))
  }
}

App.LIST_HTML = `<table class="list">
  <thead>
    <tr>
      <td onclick="finderApp.sort(\'postalcode\')">ZIP Code <span>&#x21F5;</span></td>
      <td onclick="finderApp.sort(\'count\')">Evictions <span>&#x21F5;</span></td>
    <tr>
  </thead>
  </table>`

export default App