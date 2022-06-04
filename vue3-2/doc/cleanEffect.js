;(function () {
  let set = new Set(['a'])
  set.forEach(v => {
    console.log(12)
    set.delete('a')
    set.add('a')
  })
})
;(function () {
  let set = new Set(['a'])

  const set1 = new Set(set)
  set1.forEach(v => {
    console.log(12)
    set.delete('a')
  })
})()
