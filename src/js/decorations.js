import soda from './soda'

const decorations = {
  getCount() {
    //todo break loop
    let count = 0
    this.app.zips.some(zip => {
      const featureZip = this.get('ZIP')
      const normalizeBy = this.app.normalizeBy
      if (zip.zip === featureZip) {
        if (normalizeBy !== 'none') {
          const demoZip = this.app.demographics[featureZip]
          if (demoZip) {
            const norm = demoZip[normalizeBy] * 100
            count = (zip.count / norm).toFixed(2) * 1
            console.warn(count)
          }
        } else {
          count = zip.count * 1
        }
        return true
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