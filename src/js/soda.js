const today = new Date()
const then = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())
const date = then.toISOString().split(':')[0]

export default {
  EVICTION: {
    name: 'Evictions',
    url: 'https://data.cityofnewyork.us/resource/6z8x-wfk4.json?$select=eviction_zip%20as%20zip,%20count(eviction_zip)%20as%20count&$group=eviction_zip'
  },
  LITIGATION: {
    name: 'Housing Litigations',
    url: 'https://data.cityofnewyork.us/resource/59kj-x8nc.json?$select=zip,%20count(zip)%20as%20count&$group=zip'
  },
  DOB_COMPLAINT: {
    name: 'DOB Complaints Received',
    url: 'https://data.cityofnewyork.us/resource/eabe-havv.json?$select=zip_code%20as%20zip,%20count(zip_code)%20as%20count&$group=zip_code'
  },
  '311_COMPLAINT': { //Need actual coplaint type
    name: '311 Complaints Received',
    url: `https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=incident_zip%20as%20zip,%20count(incident_zip)%20as%20count&$group=incident_zip&$where=created_date>'${date}'%20AND%20complaint_type='Noise'`
  },
  OMO: {
    name: 'Open Market Order (OMO) Charges',
    url: 'https://data.cityofnewyork.us/resource/mdbu-nrqn.json?$select=zip,%20count(zip)%20as%20count&$group=zip'
  },
  ORDER_TO_REPAIR: {
    name: 'Order to Repair/Vacate Orders',
    url: 'https://data.cityofnewyork.us/resource/tb8q-a3ar.json?$select=postoce%20as%20zip,%20count(postoce)%20as%20count&$group=postoce'
  },
  CONH: {
    name: 'Certification of No Harassment (CONH) List',
    url: 'https://data.cityofnewyork.us/resource/bzxi-2tsw.json?$select=zipcode%20as%20zip,%20count(zipcode)%20as%20count&$group=zipcode'
  },
  SPECULATION: {
    name: 'Speculation Watch List',
    url: 'https://data.cityofnewyork.us/resource/adax-9mit.json?$select=postcode%20as%20zip,%20count(postcode)%20as%20count&$group=postcode'
  }
}
