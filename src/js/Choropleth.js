import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'
import Container from 'nyc-lib/nyc/Container'
import Stats from './Stats'

class Choropleth extends Container {
  constructor(options) {
    super(Choropleth.HTML)
    
    const counts = [] 
    for (let i = 7; i > 1; i--) {
      counts.push({name: 'count', label: `${i} classifications`, values: [i]})
    }
    counts[0].checked = true
    this.count = new Choice({
      target: $('<div></div>'),
      choices: counts,
      radio: true
    })
    this.appendCollapsible('Number of classifications', this.count.getContainer(), 'count')

    this.method = this.choicesFromKeys(Stats.METHODS, 'method', 'mthd')
    this.colorScheme = this.choicesFromKeys(Choropleth.COLORS, 'colorScheme', 'clr-sch')
    this.colors = this.choicesFromKeys({}, 'color', 'clr')
    this.appendCollapsible('Classification method', this.method.getContainer(), 'cls-mth')
    this.appendCollapsible('Color scheme', this.colorScheme.getContainer(), 'clr-sch')
    this.colorsClps = this.appendCollapsible('Color', this.colors.getContainer(), 'clr')
    this.apply = $('<button class="btn rad-all apply">Apply</button>')
    this.getContainer().append(this.apply)
    this.colorScheme.on('change', this.colorChoices, this)
    this.apply.click($.proxy(this.btnHdlr, this))
    this.count.on('change', this.adjustColors, this)
    this.method.on('change', this.adjustCounts, this)
    this.val(options)
  }
  adjustCounts() {
    const lastCount = this.count.val()[0].values[0]
    const std = this.method.val()[0].values[0] === Stats.METHODS.stdDeviation.name
    
    let i = 7
    let checked = false
    const counts = [] 
    while (i > 1) {
      if (std) {
        if (i % 2) {
          counts.push({
            name: 'count', 
            label: `${i} classifications`, 
            values: [i],
            checked: i === lastCount
          })
          if (i === lastCount) {
            checked = true
          }
        }
      } else {
        counts.push({
          name: 'count', 
          label: `${i} classifications`, 
          values: [i],
          checked: i === lastCount
        })
        if (i === lastCount) {
          checked = true
        }
      }
      i--
    }
    if (!checked) {
      counts[0].checked = true
    }
    this.count.setChoices(counts)
    this.count.trigger('change', this.count)
  }
  adjustColors() {
    const size = this.count.val()[0].values[0]
    const colorScheme = this.colorScheme.val()[0].label.toLowerCase()
    const colors = Choropleth.COLORS[colorScheme].values
    const inputs = this.colors.inputs
    const choices = []
    colors.forEach((color, i) => {
      const label = $('<div class="clr">&nbsp;</div>')
      const values = this.resizeColors(color, size)
      const input = $(inputs.get(i))
      values.forEach(color => {
        label.append(`<div style="background-color:${color}"></div>`)
      })
      label.append('<div class="rev">&#x21C4;</div>')
      choices.push({
        label,
        name: input.attr('name'),
        values,
        checked: input.prop('checked')
      })
    })
    this.colors.setChoices(choices)
  }
  val(options) {
    if (options) {
      this.count.choices.forEach(choice => {
        if (choice.values[0] === options.count) {
          this.method.val([choice])
        }
      })
      this.method.choices.forEach(choice => {
        if (choice.values[0] === options.method) {
          this.method.val([choice])
        }
      })
      this.colorScheme.choices.forEach(choice => {
        if (choice.label.toLowerCase() === options.colorScheme) {
          this.colorScheme.val([choice])
        }
      })
      this.colorScheme.trigger('change', this.colorScheme)
      this.colors.choices.forEach(choice => {
        if (choice.values === options.colors) {
          this.colors.val([choice])
        }
      })
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
  choicesFromKeys(obj, name, css) {
    const choices = []
    Object.keys(obj).forEach(key => {
      const props = obj[key]
      let label = props.label
      let values = props.values
      if (!$.isArray(values)) {
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
  colorChoices() {
    const choices = []
    this.colorScheme.val().forEach(schemes => {
      schemes.values.forEach((scheme, i) => {
        const label = $('<div class="clr">&nbsp;</div>')
        scheme.forEach(color => {
          label.append(`<div style="background-color:${color}"></div>`)
        })
        choices.push({
          name: 'colors', 
          label, 
          values: scheme, 
          checked: $(this.colors.inputs[i]).prop('checked')
        })
      })
    })
    this.colors.setChoices(choices)
    if (!this.colorsClps.find('.content').is(':visible')){
      this.colorsClps.toggle()
    }
    this.adjustColors()
    if (this.colors.val().length === 0) {
      this.colors.val([this.colors.choices[0]])
    }
  }
  legItem(color, min, max, places) {
    places = places || 0
    return $(`<div class="it">
      <div class="sym" style="background-color:${color}">&nbsp;</div>
      <div class="gt">${new Number(min.toFixed(places)).toLocaleString()}</div>
      <div class="to">-</div>
      <div class="lt">${new Number(max.toFixed(places)).toLocaleString()}</div>
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
          $('<div class="op">&gt;</div>').insertBefore(item.children().last())
        }
        items.append(item)
      }
    })
    return legend
  }
}

Choropleth.COLORS = {
  divergent: {
    label: 'Divergent',
    values: [
      ['#762a83', '#af8dc3', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#7fbf7b', '#1b7837'],
      ['#8c510a', '#d8b365', '#f6e8c3', '#f5f5f5', '#c7eae5', '#5ab4ac', '#01665e'],
      ['#b2182b', '#ef8a62', '#fddbc7', '#ffffff', '#e0e0e0', '#999999', '#4d4d4d']
    ]
  },
  sequential: {
    label: 'Sequential',
    values: [
      ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
      ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
      ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026']     
    ]
  }
}

Choropleth.HTML = '<div class="choro"></div>'

Choropleth.LEGEND_HTML = `<div class="leg" title="Map legend">
  <h3></h3>
  <div class="its"></div>
</div>`

export default Choropleth
