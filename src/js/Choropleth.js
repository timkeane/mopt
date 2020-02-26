import Dialog from 'nyc-lib/nyc/Dialog'
import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'

class Choropleth {
  constructor() {
    this.dialog = new Dialog()
    this.form = $('<div class="form"><div></div>')
    this.method = this.choicesFromKeys(Choropleth.METHODS, 'method')
    this.colorType = this.choicesFromKeys(Choropleth.COLORS, 'colorType', 'Color scheme', 'clr-sch')
    this.appendCollapsible('Classification method', this.method.getContainer(), 'cls-mth')
    this.appendCollapsible('Color scheme', this.colorType.getContainer(), 'clr-sch', true)
    this.colorCollapsible = this.appendCollapsible('Colors', null, 'clrs', true)
    this.colorType.on('change', this.colorChoices, this)
  }
  appendCollapsible(title, content, css, collapsed) {
    const collapsible = new Collapsible({
      target: $(`<div class="${css}"></div>`),
      title,
      content,
      collapsed
    })
    this.form.append(collapsible.getContainer())
    return collapsible
  }
  choicesFromKeys(obj, name, title, css, collapsed) {
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
    event.choices.forEach(choice => {
      const label = $('<div class="clr"></div>')
      choice.values.forEach(color => {
        label.append(`<div style="background-color:${color}"></div>`)
      })
      choices.push({name: 'colors', label, values: choice.values})
    })
    this.colorCollapsible.getContainer().find('.content').html(
      new Choice({
        target: $(`<div class="clrs"></div>`),
        choices,
        radio: true
      }).getContainer()
    )
  }
  define() {
    return this.dialog.yesNo({
      message: this.form,
      buttonText: ['Apply', 'Cancel']
    })
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
