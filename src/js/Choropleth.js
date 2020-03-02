import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'
import Container from 'nyc-lib/nyc/Container'
import Stats from './Stats'

class Choropleth extends Container {
  constructor(options) {
    super(Choropleth.HTML)
    this.method = this.choicesFromKeys(Stats.METHODS, 'method', 'mthd')
    this.colorType = this.choicesFromKeys(Choropleth.COLORS, 'colorType', 'clr-sch')
    this.colors = this.choicesFromKeys({}, 'color', 'clr')
    this.appendCollapsible('Classification method', this.method.getContainer(), 'cls-mth')
    this.appendCollapsible('Color scheme', this.colorType.getContainer(), 'clr-sch')
    this.colorsClps = this.appendCollapsible('Color', this.colors.getContainer(), 'clr')
    this.count = this.find('select.count')
    this.apply = $('<button class="btn rad-all apply">Apply</button>')
    this.getContainer().append(this.apply)
    this.colorType.on('change', this.colorChoices, this)
    this.apply.click($.proxy(this.btnHdlr, this))
    this.count.change($.proxy(this.adjustColors, this))
    this.method.on('change', this.adjustCounts, this)
    this.val(options)
  }
  adjustCounts() {
    const count = this.count.val()
    const std = this.method.val()[0].values[0] === Stats.METHODS.stdDeviation.name
    this.count.empty()
    let i = 7
    while (i > 1) {
      if (std) {
        if (i % 2) {
          this.count.append(`<option value="${i}">${i} Classifications</options>`)
        }
      } else {
        this.count.append(`<option value="${i}">${i} Classifications</options>`)
      }
      i--
    }
    if (std) {
      if (count % 2) {
        this.count.val(count)
      } else {
        this.count.val(7)
      }
    } else {
      this.count.val(count)
    }
    this.count.trigger('change')
  }
  adjustColors() {
    const size = $(this.count).val()
    const colorType = this.colorType.val()[0].label
    const colors = Choropleth.COLORS[colorType]
    const inputs = this.colors.inputs
    const choices = []
    colors.forEach((color, i) => {
      const label = $('<div class="clr">&nbsp;</div>')
      const values = this.resizeColors(color, size)
      const input = $(inputs.get(i))
      values.forEach(color => {
        label.append(`<div style="background-color:${color}"></div>`)
      })
      choices.push({
        label,
        name: input.attr('name'),
        values,
        checked: input.is(':checked')
        })
    })
    this.colors.setChoices(choices)
  }
  val(options) {
    if (options) {
      this.count.val(options.count)
      this.method.choices.forEach(choice => {
        if (choice.values[0] === options.method) {
          this.method.val([choice])
        }
      })
      this.colorType.choices.forEach(choice => {
        if (choice.label === options.colorType) {
          this.colorType.val([choice])
        }
      })
      this.colorType.trigger('change', this.colorType)
      this.colors.choices.forEach(choice => {
        if (choice.values === options.colors) {
          this.colors.val([choice])
        }
      })
      this.colors.choices
    } else {
      let colors = this.colors.val()[0].values
      colors = this.resizeColors(colors, this.count.val())
      return {
        method: this.method.val()[0].values[0],
        colors
      }
    }
  }
  resizeColors(original, size) {
    const modified = []
    original.forEach(element => {
      modified.push(element)
    })
    while (modified.length > size) {
      const mid = Math.floor((modified.length - 1) / 2)
      modified.splice(mid, 1)
    }
    return modified
  }
  btnHdlr(event) {
    this.trigger('change', this)
  }
  appendCollapsible(title, content, css) {
    const collapsible = new Collapsible({
      target: $(`<div class="${css}"></div>`),
      title,
      content,
      collapsed: title === 'Color'
    })
    this.getContainer().append(collapsible.getContainer())
    return collapsible
  }
  choicesFromKeys(obj, name, title, css) {
    const choices = []
    Object.keys(obj).forEach(key => {
      const props = obj[key]
      let label = key
      let values = props
      if (!$.isArray(values)) {
        label = props.label
        values = [props.name]
      }
      choices.push({name, label, values})
    })
    const radio = new Choice({
      target: $(`<div class="${css}"></div>`),
      choices: choices,
      radio: true
    })
    return radio
  }
  colorChoices(event) {
    const choices = []
    event.val().forEach(colorSchemes => {
      colorSchemes.values.forEach(colorScheme => {
        const label = $('<div class="clr">&nbsp;</div>')
        colorScheme.forEach(color => {
          label.append(`<div style="background-color:${color}"></div>`)
        })
        choices.push({name: 'colors', label, values: colorScheme})
      })
    })
    this.colors.setChoices(choices)
    if (!this.colorsClps.find('.content').is(':visible')){
      this.colorsClps.toggle()
    }
  }
  legItem(color, min, max, places) {
    places = places || 0
    return $(`<div class="it">
      <div class="sym" style="background-color:${color}">&nbsp;</div>
      <div class="gt">${min.toFixed(places)}</div>
      <div class="to">-</div>
      <div class="lt">${max.toFixed(places)}</div>
    </div>`)
  }
  legend(title, classifications, colors, places) {
    const legend = $(Choropleth.LEGEND_HTML)
    const items = legend.find('.its')
    legend.find('h3').html(title)
    classifications.forEach((cls, i) => {
      if (i < classifications.length - 1) {
        const item = this.legItem(colors[i], cls, classifications[i + 1], places)
        if (i === 0) {
          $(item.children().get(1)).remove()
          $(item.children().get(1)).remove()
          $('<div class="op">&lt;</div>').insertBefore($(item.children().get(1)))
        }
        if (i === classifications.length - 2) {
          item.children().last().remove()
          item.children().last().remove()
          $('<div class="op">&lt;</div>').insertBefore(item.children().last())
        }
        items.append(item)
      }
    })
    return legend
  }
}

Choropleth.COLORS = {
  divergent: [
    ['#762a83', '#af8dc3', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#7fbf7b', '#1b7837'],
    ['#8c510a', '#d8b365', '#f6e8c3', '#f5f5f5', '#c7eae5', '#5ab4ac', '#01665e'],
    ['#b2182b', '#ef8a62', '#fddbc7', '#ffffff', '#e0e0e0', '#999999', '#4d4d4d']
  ],
  sequential: [
    ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
    ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
    ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026']     
  ]
}
Choropleth.LIMITS = [2, 7]

Choropleth.HTML = `<div class="choro">
  <select class="btn rad-all count">
    <option value="7">7 classifications</option>
    <option value="6">6 classifications</option>
    <option value="5">5 classifications</option>
    <option value="4">4 classifications</option>
    <option value="3">3 classifications</option>
    <option value="2">2 classifications</option>
  </select>
</div>`

Choropleth.LEGEND_HTML = `<div class="leg">
  <h3></h3>
  <div class="its"></div>
</div>`

export default Choropleth
