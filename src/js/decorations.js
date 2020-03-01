import soda from './soda'

const decorations = {
  getCount() {
    let count = 0
    this.app.zips.some(zip => {
      if (zip.zip === this.get('ZIP')) {
        count = zip.normal ? (zip.normal).toFixed(2) : zip.count
        return true
      }
    })
    return count * 1
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
  featureForCount(count) {
    let featureForCount
    const features = this.app.source.getFeatures()
    features.some(feature => {
      if (feature.getCount() === count * 1) {
        featureForCount = feature
        return true
      }
    })
    return featureForCount
  },
  html() {
    const html = $('<div class="compare"></div>')
    const min = this.app.stats.min()
    const med = this.app.stats.median()
    const max = this.app.stats.max()
    const count = this.getCount()
    const labels = {}
    labels[min] = `<strong>Minimum:</strong> ${this.featureForCount(min).getName()}`
    labels[med] = `<strong>Median:</strong> ${this.featureForCount(med).getName()}`
    labels[max] = `<strong>Maximum:</strong> ${this.featureForCount(max).getName()}`
    if (labels[count]) {
      labels[count] = `<strong><em>
        ${$($(labels[count])[0]).html()} ${this.getName()}
      </em></strong>`
    } else {
      labels[count] = `<strong><em>${this.getName()}</em></strong>`
    }
    const bars = Object.keys(labels).sort((a, b) => {
      if (a * 1 < b * 1) return -1
      if (a * 1 > b * 1) return 1
      return 0
    })
    html.append(this.getTip())
    bars.forEach((c, i) => {
      const feature = this.featureForCount(c)
      html.append(`<div class="name">${labels[c]}</div>`)
        .append(`<div class="bar" style="width:calc(${c * 100 / max}% - 50px);min-width:1px;"></div>`)
        .append(` ${c}`)
    })
    return html
  },
  row() {
    const row1 =  $('<tr class="lst-it"></tr>')
      .append(`<td class="name notranslate">${this.getName()}</td>`)
      .append(`<td class="count">${this.getCount()}</td>`)
    const row2 =  $('<tr class="lst-dtl"></tr>')
      .append($(`<td colspan="2"></td>`).html(this.html()))
    row1.click(event => {
      const target = $(event.currentTarget)
      target.toggleClass('open')
      row2.slideToggle()
    })
    return [row1, row2]
  },
  getTip() {
    return `<div class="tip-title">
      <h3>${this.getName()}</h3>
      <div>${this.getCount()} ${this.app.units()}</div>
    </div>`
  }
}

export default decorations