/**
 * @module Stats
 */

import * as ss from 'simple-statistics'

class Stats {
  constructor(data) {
    this.data = data
  }
  min() {
    return ss.min(this.data)
  }
  max() {
    return ss.max(this.data)
  }
  mean() {
    return ss.mean(this.data)
  }
  median() {
    return ss.median(this.data)
  }
  std() {
    return ss.standardDeviation(this.data)
  }
  ckmeansClasses(numClasses) {
    const classes = []
    const clusters = ss.ckmeans(this.data, numClasses)
    classes.push(clusters[0][0])
    clusters.forEach(cluster => {
      classes.push(cluster[cluster.length - 1])
    })
    return classes
  }
  equalIntervalClasses(numClasses) {
    return ss.equalIntervalBreaks(this.data, numClasses)
  }
  stdClasses(numClasses) {
    //todo
    return ss.equalIntervalBreaks(this.data, numClasses)
  }
}

Stats.METHODS = {
  equalInterval: {label: 'Equal interval', name: 'equalIntervalClasses'},
  stdDeviation: {label: 'Standard deviation', name: 'stdClasses'},
  ckmeans: {label: 'Ckmeans natural breaks', name: 'ckmeansClasses'}
}

export default Stats