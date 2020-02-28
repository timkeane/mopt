import soda from './soda'

const decorations = {
  getCount() {
    //todo break loop
    let count = 0
    this.app.zips.forEach(zip => {
      const featureZip = this.get('ZIP')
      const normalizeBy = this.app.normalizeBy
      if (zip.zip === featureZip) {
        if (normalizeBy !== 'none') {
          const norm = this.app.democraphics[featureZip][normalizeBy]
          count = 1 * Math.toFixed(zip.count * 1 / norm, 2)
        } else {
          count = zip.count * 1
        }
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