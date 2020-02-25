const decorations = {
  extendFeature() {
  },
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
  getName() {
    return this.get('postalcode')
  },
  html() {
    return $('<div class="facility"></div>')
      .append(`<h3 class="name notranslate"><span>ZIP Code: </span>${this.getName()}</h3>`)
      .append(`<div class="evict">${this.getCount()}<span> total evictions</span></div>`)
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