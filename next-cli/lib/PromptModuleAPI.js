module.exports = class PromptModuleAPI {
  // 入参 creator 为 Creator 的实例。
  constructor(creator) {
    this.creator = creator
  }
  /**
   * @Author: wyb
   * @Descripttion: 给自定义预设 featurePrompt 注入复选框值
   * @param {*} feature
   */
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature)
  }
  /**
   * @Author: wyb
   * @Descripttion: 注入其他提示
   */
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt)
  }
  /**
   * @Author: wyb
   * @Descripttion: 给指定提示添加复选框
   * @param {*} name
   * @param {*} option
   */
  injectOptionForPrompt(name, option) {
    this.creator.injectedPrompts
      .find((f) => {
        return f.name === name
      })
      .choices.push(option)
  }
  /**
   * @Author: wyb
   * @Descripttion: 注入回调
   * @param {*} cb
   */
  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb)
  }
}
