const decorations = {
  extendFeature() {
    this.set('count', 0)
    this.zips.forEach(zip => {
      if (zip.zip === this.get('postalcode')) {
        this.set('count', zip.count * 1)
      }
    })
  },
  getName() {
    return this.get('postalcode')
  },
  html() {
    return $('<div class="facility"></div>')
      .append(`<h3 class="name notranslate"><span>ZIP Code: </span>${this.getName()}</h3>`)
      .append(`<div class="evict">${this.get('count')}<span> total evictions</span></div>`)
  },
  row() {
    return $('<tr class="lst-it"></tr>')
      .append(`<td class="name notranslate">${this.getName()}</td>`)
      .append(`<td class="evict">${this.get('count')}</td>`)
  },
  getTip() {
    return this.html()
  }
}

export default decorations