import soda from './soda'

const decorations = {
  getCount() {
    //todo break loop
    let count = 0
    this.app.zips.forEach(zip => {
      if (zip.zip === this.get('ZIP')) {
        count = zip.count * 1
      }
    })
    return count
  },
  getZip() {
    return this.get('ZIP')
  },
  getName() {
    return `${this.getZip()} ${this.getPo()}`
  },
  getPo() {
    return this.get('PO')
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