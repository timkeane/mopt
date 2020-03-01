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
import Stats from './Stats'
import Choropleth from './Choropleth'
import Papa from 'papaparse'

const CLASSIFY_METHOD = Stats.METHODS.ckmeans.name
const COLORS = Choropleth.COLORS.divergent[0]
const NORMAL = [
  {col: 'POP', name: 'Total population'},
  {col: 'OWN_OCC', name: 'Total owner occupied housing units'},
  {col: 'RENT_OCC', name: 'Total renter occupied housing units'},
  {col: 'UNITS', name: 'Total housing units'}
]

class App extends FinderApp {
  constructor(zips) {
    super({
      title: 'Evictions',
      splashOptions: {
        message: 'mopt'
      },
      facilityUrl: 'data/zip.json',
      facilityFormat: new GeoJson({
        dataProjection: 'EPSG:2263',
        featureProjection: 'EPSG:3857'
      }),
      facilityTabTitle: 'Data',
      facilityStyle: facilityStyle(),
      decorations: [decorations],
      filterTabTitle: 'Symbology',
      filterChoiceOptions: [],
      geoclientUrl: 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
    })
    this.loadDemographics()
    $('#banner').addClass('geostats-legend-title')
    this.zips = zips
    this.choropleth = new Choropleth({
      count: 7,
      method: CLASSIFY_METHOD,
      colorType: 'divergent',
      colors: COLORS
    })
    this.updateStats(zips, CLASSIFY_METHOD, COLORS)
    $('#filters .apply').remove()
    this.choropleth.on('change', this.symbology, this)
    $('#filters').append(this.choropleth.getContainer())
    this.demographics = {}
    this.addChoices()
    this.adjustPager()
    this.zoomFull()
  }
  normalize() {
    if ($('#normal').val() !== 'none') {
      this.updateStats(this.zips, this.stats.__method, this.stats.__colors)
    }
  }
  addNormal() {
    const normal = $('<select id="normal" class="btn rad-all"><option value="none">Not normalized</option></select>')
    NORMAL.forEach(norm => {
      normal.append(`<option value="${norm.col}">${norm.name}</option>`)
    })
    normal.insertAfter($('#dataset'))
    normal.change($.proxy(this.normalize, this))
  }
  loadDemographics() {
    fetch('./data/demographics.csv').then(response => {
      response.text().then(csv => {
        const demographics = Papa.parse(csv, {header: true}).data
        demographics.forEach(demo => {
          this.demographics[demo.ZIP] = demo
        })
      })
    })
  }
  symbology(choropleth) {
    const values = choropleth.val()
    this.updateStats(this.zips, values.method, values.colors)
  }
  addChoices() {
    const select = $('<select id="dataset" class="btn rad-all"></select>')
      .change($.proxy(this.choose, this))
    Object.keys(soda).forEach(key => {
      select.append(`<option value="${key}">${soda[key].name}</option>`)
    })
    $('#facilities').prepend(select)
    this.addNormal()
  }
  legend() {
    const dataset = $('#dataset').val()
    const title = dataset ? soda[$('#dataset').val()].name :soda.EVICTION.name
    const legend = $(this.choropleth.legend(title, this.buckets, this.stats.__colors))
    $('div.leg').remove()
    $(this.map.getTargetElement()).append(legend)
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
  units() {
    const data = soda[$('#dataset').val()].name
    let norm = NORMAL[$('#normal').val()]
    norm = norm ? norm.name : ''
    return `${data} ${norm}`
  }
  choose(event) {
    const url = soda[event.target.value].url
    fetch(url).then(response => {
      response.json().then(json => {
        this.zips = json
        this.updateStats(this.zips, this.stats.__method, this.stats.__colors)
        this.zoomFull()
        this.sorted = {Name: false, Count: true}
        this.sort('Count')
        $('.geostats-legend-title').html(soda[event.target.value].name)
      })
    }).catch(err => {
      new Dialog().ok({message: `Unable to load ${soda[event.target.value].name} from NYC OpenData`})
    })
  }
  ready(features) {
    this.layer.setOpacity(.5)
    super.ready(this.sort('Count'))
  }
  updateStats(zips, method, colors) {
    console.warn(zips);
    const counts = []
    const normalize = $('#normal').val()
    zips.forEach(zip => {
      let z = zip.zip
      //DOB Complaints missing a lot of zips
      if (z && z.trim().length) {
        z = z.trim()
        zip.zip = z
        if (z) {
          if (normalize && normalize !== 'none') {
            const demoZip = this.demographics[z]
            if (demoZip) {
              const norm = demoZip[normalize]
              const c =  zip.count / norm
              console.warn(`normalized by ${normalize}`, zip, zip.count / norm);
              counts.push(c)
              zip.normal = c
            }
          } else {
            console.warn('not normalized', zip, zip.count * 1);
            counts.push(zip.count * 1)
            zip.normal = null
          }
        }
      }
    })
    console.warn(counts);

    this.stats = new Stats(counts)
    this.stats.__colors = colors
    this.stats.__method = method
    // this.stats.setColors(colors)
    this.buckets = this.stats[method](colors.length)
    this.legend()
    this.layer.setSource(new Source())
    this.layer.setSource(this.source)
  }
}

App.LIST_HTML = `<table class="list">
  <thead>
    <tr>
      <td onclick="finderApp.sort(\'Name\')">ZIP Code <span>&#x21F5;</span></td>
      <td onclick="finderApp.sort(\'Count\')"><span class="geostats-legend-title">Evictions</span> <span>&#x21F5;</span></td>
    <tr>
  </thead>
  </table>`

export default App
