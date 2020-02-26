import Dialog from 'nyc-lib/nyc/Dialog'

class Classify extends Dialog {
  constructor() {
    super()
    this.form = $('<div class="form"></div>')
    this.method = this.choicesFromKeys(Classify.COLORS, 'Color scheme', 'clr-sch')
    this.colorType = this.choicesFromKeys(Classify.METHODS, 'Classification method', 'cls-mth')
    this.colorType.on('change', this.colorChoices, this)
  }
  choicesFromKeys(obj, title, css) {
    const choices = []
    Object.keys(obj).forEach(key => {
      choices.push({name: key, label: key, values: obj[key]})
    })
    const radio = new nyc.Radio({
      target: $(`<div class="${css}"></div>`),
      choices: choices
    })
    const collapsible = new nyc.Collapsible({
      target: $(`<div class="${css}"></div>`),
      title: title,
      content: radio.getContainer()
    })
    this.form.append(collapsible.getContainer())
    return radio
  }
  colorChoices(colorTypes) {
    const choices = []
    colorTypes.forEach((colors, i) => {
      const label = $('<div class="clr"></div>')
      colors.forEach(color => {
        label.append(`<div style="background-color:${color}"></div>`)
      })
      choices.push({name: `${i}`, label: label, values: colors})
    })
    return new nyc.Radio({
      target: $(`<div class="${css}"></div>`),
      choices: choices
    })
  }
  classify() {
    this.yesNo({
      message: this.form,
      buttonText: ['Apply', 'Cancel']
    })
  }
}


Classify.METHODS = {
  eqInterval: 'getClassEqInterval',
  stdDeviation: 'getClassStdDeviation',
  jenks: 'getClassJenks',
  quantile: 'getClassQuantile',
  arithmeticProgression: 'getClassArithmeticProgression'
}
Classify.COLORS = {
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
Classify.LIMITS = [2, 7]

export default Classify
