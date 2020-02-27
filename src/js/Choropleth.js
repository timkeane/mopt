import Choice from 'nyc-lib/nyc/Choice'
import Collapsible from 'nyc-lib/nyc/Collapsible'
import Container from 'nyc-lib/nyc/Container'

class Choropleth extends Container {
  constructor(options) {
    super(Choropleth.HTML)
    this.method = this.choicesFromKeys(Choropleth.METHODS, 'method', 'mthd')
    this.colorType = this.choicesFromKeys(Choropleth.COLORS, 'colorType', 'clr-sch')
    this.colors = this.choicesFromKeys({}, 'color', 'clr')
    this.appendCollapsible('Classification method', this.method.getContainer(), 'cls-mth')
    this.appendCollapsible('Color scheme', this.colorType.getContainer(), 'clr-sch')
    this.colorsClps = this.appendCollapsible('Color', this.colors.getContainer(), 'clr')
    this.count = this.find('select.count')
    this.apply = $('<button class="btn rad-all apply">Apply</button>')
    this.cancel = $('<button class="btn rad-all cancel">Cancel</button>')
    this.getContainer().append(this.apply).append(this.cancel)
    this.colorType.on('change', this.colorChoices, this)
    this.apply.click($.proxy(this.btnHdlr, this))
    this.cancel.click($.proxy(this.btnHdlr, this))
    this.val(options)
  }
  val(options) {
    if (options) {
      // return this.val()
    } else {
      return {
        count: this.count.val() * 1,
        method: this.method.val()[0].values[0],
        colors: this.colors.val()[0].values
      }
    }
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
      console.warn(0, event.val());
      const choices = []
    event.val().forEach(colorSchemes => {
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
    this.colors.setChoices(choices)
    if (!this.colorsClps.find('.content').is(':visible')){
      this.colorsClps.toggle()
    }
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

export default Choropleth
