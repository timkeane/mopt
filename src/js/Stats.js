/**
 * @module Stats
 */

import * as ss from 'simple-statistics'

class Stats {
  constructor(data) {
    this.data = data
    this.ss = ss
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
  mean() {
    return ss.mean(this.data)
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
  mean() {
    return ss.mean(this.data)
  }
  stdClasses(numClasses) {
    if (numClasses % 2) {
      const classes = new Array(numClasses + 1)
      const mid = Math.ceil(numClasses / 2) -1
      const std = ss.standardDeviation(this.data)
      const mean = this.mean()
      classes[mid] = mean + 2 * std
      let i = 0
      while (i < mid) {
        i++
        classes[mid - i] = classes[mid] - (i * std)
        classes[mid + i] = classes[mid] + (i * std)
      }
      classes[0] = this.min()
      classes[classes.length - 1] = this.max()
      return classes
    }
    throw `Invalid argument ${numClasses}: 3, 5, 7 are the only valid arguments for 'Stats.stdClasses'`
  }
}

Stats.METHODS = {
  equalInterval: {label: 'Equal interval', name: 'equalIntervalClasses'},
  stdDeviation: {label: 'Standard deviation', name: 'stdClasses'},
  ckmeans: {label: 'Ckmeans natural breaks', name: 'ckmeansClasses'}
}

export default Stats