const Placement = 0b001 // 1
const Update = 0b010 // 2

let flags = 0b00

//增加操作
flags |= Placement
flags |= Update
console.log(flags.toString(2)) // 11
console.log(flags) // 3

// 删除操作
flags = flags & ~Placement
console.log(flags.toString(2)) // 10
console.log(flags) // 2

// 是否包含
console.log((flags & Placement) === Placement)
console.log((flags & Update) === Update)

// 是否不包含
console.log((flags & Placement) === 0)
console.log((flags & Update) === 0)
