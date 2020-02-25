import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

const COLORS = [
  '#fee5d9',
  '#fcbba1',
  '#fc9272',
  '#fb6a4a',
  '#ef3b2c',
  '#cb181d',
  '#99000d'
]

const style = (min, max) => {
  return (feature, resolution) => {
    const range = (max - min) / COLORS.length
    const count = feature.get('count') * 1
    let color = 'rgba(0,0,0,0)'
    COLORS.forEach((clr, i) => {
      const c = i + 1
      if (c === COLORS.length) {
        if (count >= Math.ceil(min + (i * range)) && count <= max) {
          color = clr
        }  
      } else {
        if (count >= Math.ceil(min + (i * range)) && count < Math.ceil(min + (c * range))) {
          color = clr
        }
      }            
    })

    return new Style({
      fill: new Fill({color}),
      stroke: new Stroke({width: 1, color: 'white'})
    })
  }
}

const legend = (min, max) => {
  const range = (max - min) / COLORS.length
  const table = $('<table><tbody></tbody></table>')
  const tbody = table.children().first()
  tbody.append(`<tr class="lbl"><td>${min}</td><td colspan="3">&nbsp;</td></tr>`)
  COLORS.forEach((clr, i) => {
    const c = i + 1
    const tr = $('<tr></tr>')
    let txt = `${Math.ceil(min + (i * range))} - ${Math.floor(min + (c * range))}`
    let tds = `<td>${Math.ceil(min + (i * range))}</td><td>-</td><td>${Math.floor(min + (c * range))}</td>`
    if (c === COLORS.length) {
      txt = `${Math.ceil(min + (i * range))} - ${max}`
      tds = `<td>${Math.ceil(min + (i * range))}</td>-<td></td><td>${max}</td>`
    }
    tr.append(`<td class="sym" style="background-color:${clr}" title="${txt}"></td>`)
      .append(tds)
    tbody.append(tr)
  })
  tbody.append(`<tr class="lbl"><td>${max}</td><td class="txt">&nbsp;</td></tr>`)
  return $('<div class="legend"><h3>Total Evictions</h3></div>').append(table)
}

export default {style, legend}





