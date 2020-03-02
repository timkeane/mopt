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
    return new Number(count)
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
    const html = $('<div class="compare"></div>')
    const median = this.app.median
    const mean = this.app.mean
    const count = this.getCount()
    const values = [median, mean, count].sort((a, b) => {
      if (a * 1 < b * 1) return 1
      if (a * 1 > b * 1) return -1
      return 0
    })
    const large = values[0]
    html.append(`<h3>${this.app.units()}</h3>`)
    html.append(`<div class="name">${this.getName()}</div>`)
      .append(`<div class="bar" style="width:${count * 260 / large}px;min-width:1px;"></div>`)
      .append(`  ${new Number(count.toFixed(2)).toLocaleString()}`)
      .append(`<div class="lbl">City-wide median</div>`)
      .append(`<div class="bar" style="width:${median * 260 / large}px;min-width:1px;"></div>`)
      .append(`  ${new Number(median.toFixed(2)).toLocaleString()}`)
      .append('<div class="lbl">City-wide mean</div>')
      .append(`<div class="bar" style="width:${mean * 260 / large}px;min-width:1px;"></div>`)
      .append(`  ${new Number(mean.toFixed(2)).toLocaleString()}`)
    return html
  },
  row() {
    const row1 =  $('<tr class="lst-it"></tr>')
      .append(`<td class="name notranslate">${this.getName()}</td>`)
      .append(`<td class="count">${this.getCount().toLocaleString()}</td>`)
    const row2 =  $('<tr class="lst-dtl"></tr>')
      .append($(`<td colspan="2"></td>`).html(this.html()))
      row1.data('html', row2.html())
      row1.click(event => {
      const target = $(event.currentTarget)
      const html = target.data('html')
      const colspan = target.find('td').attr('colspan')
      target.data('html', target.html())
      if (colspan) {
        target.find('td').removeAttr('colspan')
      } else {
        target.find('td').attr('colspan', 2)
      }
      target.html(html)
      target.toggleClass('open')
      row2.slideToggle()
    })
    return row1
  },
  getTip() {
    return `<div class="tip-title">
      <h3>${this.getName()}</h3>
      <div>${this.getCount().toLocaleString()} ${this.app.units()}</div>
    </div>`
  }
}

export default decorations