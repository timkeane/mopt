export default {
  EVICTION: {
    name: 'Evictions',
    url: 'https://data.cityofnewyork.us/resource/6z8x-wfk4.json?$select=eviction_zip%20as%20zip,%20count(eviction_zip)%20as%20count&$group=eviction_zip'
  },
  LITIGATION: {
    name: 'Housing Litigations',
    url: 'https://data.cityofnewyork.us/resource/59kj-x8nc.json?$select=Zip%20as%20zip,%20count(Zip)%20as%20count&$group=Zip'
  }
}