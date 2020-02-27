import soda from './soda'

const decorations = {
  getCount() {
    //todo break loop
    let count = 0
    this.app.zips.forEach(zip => {
      if (zip.zip === this.get('postalcode')) {
        count = zip.count * 1
      }
    })
    return count
  },
  getZip() {
    return this.get('postalcode')
  },
  getName() {
    return `${this.getZip()} ${this.getPo()}`
  },
  getPo() {
    const boro = this.get('borough')
    const po = this.get('po_name')
    return boro === 'Queens' ? `${po}, ${boro}` : po

  },
  html() {
    return $('<div class="facility"></div>')
      .append(`<h3 class="name notranslate">${this.getName()}</h3>`)
      .append(`<div>${this.getCount()} total ${soda[$('#dataset').val()].name}</div>`)
  },
  row() {
    return $('<tr class="lst-it"></tr>')
      .append(`<td class="name notranslate">${this.getName()}</td>`)
      .append(`<td class="evict">${this.getCount()}</td>`)
  },
  getTip() {
    return this.html()
  }
}

export default decorations