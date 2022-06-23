// [5, 3, 4, 0]

function getSequence(arr) {
  const len = arr.length
  const res = [0]
  const p = new Array(len).fill(0) // 记录当前元素前面的元素的索引
  for (let i = 0; i < len; i++) {
    const val = arr[i]
    // 如果是0 在vue3中意味着新增节点 则不计入最长递增子序列列表
    if (val !== 0) {
      const lastIndex = res[res.length - 1]
      // 如果当前比res中最大的还大 则需要往res中新增
      if (val > arr[lastIndex]) {
        p[i] = lastIndex
        res.push(i)
      } else {
        // 需要在res中找到第一个比它大的 替换调它
        let start = 0,
          end = res.length - 1
        while (start < end) {
          const mid = ((start + end) / 2) >> 0
          const cur = arr[res[mid]]
          if (val > cur) {
            start = mid + 1
          } else {
            end = mid
          }
        }
        // 如果找到最终比它大的 则替换掉它
        if (val < arr[res[start]]) {
          p[i] = res[start - 1]
          res[start] = i
        }
      }
    }
  }

  let i = res.length
  let last = res[i - 1]
  while (i-- > 0) {
    res[i] = last
    last = p[last]
  }

  return res
}

// console.log(getSequence([1, 2, 3, 4, 5]))
console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))
