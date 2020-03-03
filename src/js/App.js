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
import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'
import Dialog from 'nyc-lib/nyc/Dialog'
import fetchTimeout from './fetchTimeout'

const CLASSIFY_METHOD = Stats.METHODS.ckmeans.name
const COLORS = Choropleth.COLORS.sequential.values[2]
const NORMAL = {
  POP: {name: `per ${new Number(1000).toLocaleString()} residents`, factor: 1000},
  OWN_OCC: {name: `per ${new Number(1000).toLocaleString()} owner occupied housing units`, factor: 1000},
  RENT_OCC: {name: `per ${new Number(1000).toLocaleString()} renter occupied housing units`, factor: 1000},
  UNITS: {name: `per ${new Number(1000).toLocaleString()} housing units`, factor: 1000}
}

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
      filterTabTitle: 'Visualize',
      filterChoiceOptions: [],
      geoclientUrl: 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
    })
    $('#banner').addClass('leg-title')
    this.colors = COLORS
    this.method = CLASSIFY_METHOD
    this.zips = zips
    $('#filters .apply').remove()
    
    this.choropleth = new Choropleth({
      count: 7,
      method: CLASSIFY_METHOD,
      colorType: 'sequential',
      colors: COLORS
    })
    this.choropleth.on('change', this.symbology, this)
    $('#filters').append(this.choropleth.getContainer())

    this.demographics = {}
    $('#facilities').prepend('<h2 class="leg-title"></h2>')

    this.normal = this.dataChoices(
      NORMAL,
      'normal', 
      'Normalize', 
      [{
        name: 'normal', 
        label: 'Not normalized', 
        values: [false]
      }]
    )    
    this.normal.on('change', this.chooseNormal, this)

    this.dataset = this.dataChoices(soda, 'dataset', 'Dataset', [])
    this.dataset.on('change', this.chooseData, this)

    this.adjustPager()
    this.loadDemographics()
    this.updateStats(zips)
    this.zoomFull()
  }
  chooseNormal() {
    const normal = $('#normal').val()
    if (normal !== 'none') {
      this.updateStats(this.zips)
    }
  }
  loadDemographics() {
    fetchTimeout('./data/demographics.csv').then(response => {
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
    this.method = values.method
    this.colors = values.colors
    this.updateStats(this.zips)
    if (this.isMobile()) {
      this.tabs.open('#map')
    }
  }
  dataChoices(obj, name, title, choices) {
    Object.keys(obj).forEach(key => {
      choices.push({
        name,
        label: obj[key].name,
        values: [key]
      })
    })
    choices[0].checked = true
    const radio = new Choice({
      target: $('<div></div>'),
      choices, 
      radio: true
    })
    const collapse = new Collapsible({
      target: $('<div></div>'),
      title,
      content: radio.getContainer(),
      collapsed: true
    })
    $('#facilities').prepend(collapse.getContainer())
    return radio
  }
  legend() {
    const dataset = this.dataset.val()[0].values[0]
    const legend = $(this.choropleth.legend(this.units(), this.buckets, this.colors))
    $('div.leg').remove()
    $(this.map.getTargetElement()).append(legend)
    legend.click(() => {legend.toggleClass('btn btn-sq rad-all')})
  }
  adjustPager() {
    this.sorted = {Name: false, Count: false}
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
  sort(prop, descend) {
    const features = this.source.getFeatures()
    this.sorted[prop] = !this.sorted[prop]
    features.sort((f0, f1) => {
      const a = f0[`get${prop}`]()
      const b = f1[`get${prop}`]()
      if (a < b) {
        return descend || this.sorted[prop] ? 1 : -1
      } else if (a > b) {
        return descend || this.sorted[prop] ? -1 : 1
      }
      return 0
    })
    this.pager.reset(features)
    return features
  }
  units() {
    const dataset = soda[this.dataset.val()[0].values[0]].name
    let units = NORMAL[this.normal.val()[0].values[0]]
    units = units ? units.name : ''
    return `${dataset} ${units}`.trim()
  }
  chooseData(event) {
    const dataset = soda[this.dataset.val()[0].values[0]]
    const url = dataset.url
    fetch(url).then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      response.json().then(json => {
        this.zips = json
        this.updateStats(this.zips)
        this.zoomFull()
      })
    }).catch(err => {
      new Dialog().ok({message: `Unable to load <strong>${dataset.name}</strong> from NYC OpenData`})
    })
  }
  ready(features) {
    this.layer.setOpacity(.5)
    super.ready(this.sort('Count', true))
  }
  updateStats(zips) {
    const counts = []
    const normal = this.normal.val()[0].values[0]
    zips.forEach(zip => {
      let z = zip.zip
      //DOB Complaints missing a lot of zips
      if (z && z.trim().length) {
        z = z.trim()
        zip.zip = z
        if (z) {
          if (normal && normal !== 'none') {
            const demoZip = this.demographics[z]
            if (demoZip) {
              const norm = demoZip[normal] * 1
              const factor = NORMAL[normal].factor
              let c = 0 
              if (norm !== 0) {
                c = factor * zip.count / norm
              }
              counts.push(c)
              zip.normal = c
            }
          } else {
            counts.push(zip.count * 1)
            zip.normal = null
          }
        }
      }
    })
    this.stats = new Stats(counts)
    this.mean = this.stats.mean()
    this.median = this.stats.median()
    this.buckets = this.stats[this.method](this.colors.length)
    this.sort('Count', true)
    this.legend()
    $('.leg-title').html(this.units())
    this.layer.setSource(new Source())
    this.layer.setSource(this.source)
  }
}

App.LIST_HTML = `<table class="list">
  <thead>
    <tr>
      <td onclick="finderApp.sort(\'Name\')">ZIP Code <span>&#x21F5;</span></td>
      <td onclick="finderApp.sort(\'Count\')">Count <span>&#x21F5;</span></td>
    <tr>
  </thead>
  </table>`

export default App
