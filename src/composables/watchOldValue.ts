import { cloneDeep } from 'lodash'

export default function (source, callback, options) {
  const val = toValue(source)
  if (typeof val !== 'object' || val === null) {
    return watch(source, callback, options)
  }

  let oldValue = cloneDeep(toValue(source))
  return watch(
    source,
    (newValue) => {
      callback(newValue, oldValue)
      oldValue = cloneDeep(toValue(source))
    },
    options,
  )
}
