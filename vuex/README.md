# vuex

### state
### getters
### mutations
### actions
### modules
> state 根上的属性名和模块名冲突 会被模块替代

> getters  
1.不使用 namespace 命名不能同名冲突 因为模块内的getters会合并到根上
2.使用 namespace 加模块名取值

> mutations  
1.不使用 namespace 会将所有的重名合并成一个数组，依次执行  
2.使用 namespace 默认只会执行根的 如果想执行对应模块的 前面需要加上模块名

### 插件机制

### 动态注册模块

### strict 模式

### 四个辅助函数