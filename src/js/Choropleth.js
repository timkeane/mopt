import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'
import Container from 'nyc-lib/nyc/Container'

class Choropleth extends Container {
  constructor() {
    super('<div class="choro"></div>')
    this.method = this.choicesFromKeys(Choropleth.METHODS, 'method', 'mthd')
    this.colorType = this.choicesFromKeys(Choropleth.COLORS, 'colorType', 'clr-sch')
    this.color = this.choicesFromKeys({}, 'color', 'clr')
    this.appendCollapsible('Classification method', this.method.getContainer(), 'cls-mth')
    this.appendCollapsible('Color scheme', this.colorType.getContainer(), 'clr-sch')
    this.appendCollapsible('Color', this.color.getContainer(), 'clr')
    this.apply = $('<button class="btn rad-all apply">Apply</button>')
    this.cancel = $('<button class="btn rad-all cancel">Cancel</button>')
    this.getContainer().append(this.apply).append(this.cancel)
    this.colorType.on('change', this.colorChoices, this)
    this.apply.click($.proxy(this.btnHdlr, this))
    this.cancel.click($.proxy(this.btnHdlr, this))
  }
  btnHdlr(event) {
    if ($(event.target).hasClass('apply')) {
      this.trigger('change', this)
    }
  }
  appendCollapsible(title, content, css) {
    const collapsible = new Collapsible({
      target: $(`<div class="${css}"></div>`),
      title,
      content,
      collapsed: true
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
    event.choices.forEach(colorSchemes => {
      console.warn(1, colorSchemes);
      colorSchemes.values.forEach(colorScheme => {
        const label = $('<div class="clr">&nbsp;</div>')
        console.warn(2,colorScheme);
        colorScheme.forEach(color => {
          console.warn(3,color);
          label.append(`<div style="background-color:${color}"></div>`)
        })
        choices.push({name: 'colors', label, values: colorScheme})
      })
    })
    this.color.setChoices(choices)
  }
}

Choropleth.METHODS = {
  eqInterval: {label: 'Equal interval', name: 'getClassEqInterval'},
  stdDeviation: {label: 'Standard deviation', name: 'getClassStdDeviation'},
  jenks: {label: 'Jenks natural breaks', name: 'getClassJenks'},
  quantile: {label: 'Quantile breaks', name: 'getClassQuantile'},
  arithmeticProgression: {label: 'Arithmetic progression', name: 'getClassArithmeticProgression'}
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

export default Choropleth
