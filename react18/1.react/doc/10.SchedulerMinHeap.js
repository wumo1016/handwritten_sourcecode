// 添加
function push(heap, node) {
  heap.push(node)
  siftUp(heap, node, heap.length - 1)
}
// 弹出堆顶
function pop(heap) {
  // 取出数组中第一个也就是堆顶的元素
  const first = heap[0]
  if (first !== undefined) {
    // 弹出数组中的最后一个元素
    const last = heap.pop()
    if (last !== first) {
      heap[0] = last
      siftDown(heap, last, 0)
    }
    return first
  } else {
    return null
  }
}
// 查看堆顶的元素
function peek(heap) {
  const first = heap[0]
  return first === undefined ? null : first
}
// 向上调整某个节点，使其位于正确的位置
function siftUp(heap, node, i) {
  let index = i
  while (true) {
    // 获取父节点的索引
    const parentIndex = (index - 1) >>> 1 // (子节点索引-1)/2
    // 获取父节点
    const parent = node[parentIndex]
    // 如果父节点存在，并且父节点比子节点要大
    if (parent !== undefined && compare(parent, node) > 0) {
      // 父子交换位置
      heap[parentIndex] = node
      heap[index] = parent
      index = parentIndex
    } else {
      // 如果子节点比父节要大，不需要交换位置，结束循环
      return
    }
  }
}
// 向下调整某个节点，使其位于正确的位置
function siftDown(heap, node, i) {
  let index = i
  const length = heap.length
  while (index < length) {
    // 获取子的左右节点
    const leftIndex = (index + 1) * 2 - 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]
    //如果左子节点存在，并且左子节点比父节点要小
    if (left !== undefined && compare(left, node) < 0) {
      // 如果右节点存在，并且右节点比左节点还要小
      if (right !== undefined && compare(right, left) < 0) {
        // 父右交换
        heap[index] = right
        heap[rightIndex] = node
        index = rightIndex
      } else {
        // 父左交换
        heap[index] = left
        heap[leftIndex] = node
        index = leftIndex
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      // 父右交换
      heap[index] = right
      heap[rightIndex] = node
      index = rightIndex
    } else {
      return
    }
  }
}
// 比较 a 是否比 b 大
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}

let heap = []
let id = 1
push(heap, { sortIndex: 1, id: id++ })
push(heap, { sortIndex: 2, id: id++ })
push(heap, { sortIndex: 3, id: id++ })
push(heap, { sortIndex: 4, id: id++ })
push(heap, { sortIndex: 5, id: id++ })
push(heap, { sortIndex: 6, id: id++ })
push(heap, { sortIndex: 7, id: id++ })
console.log(peek(heap))
pop(heap)
console.log(peek(heap))
