import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

const style = () => {
  return (feature, resolution) => {
    const stats = feature.app.stats
    const buckets = feature.app.buckets || []
    const count = feature.getCount() * 1
    let color = 'rgba(0,0,0,0)'
    stats.__colors.forEach((clr, i) => {
      const c = i + 1
      if (c === buckets.length) {
        if (count >= buckets[i] && count <= buckets[buckets.length - 1]) {
          color = clr
        }  
      } else {
        if (count >= buckets[i] && count < buckets[c]) {
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

export default style





