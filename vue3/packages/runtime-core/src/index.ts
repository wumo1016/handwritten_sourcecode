
export function createRenderer(renderOptions){
  return {
    createApp(rootComp, rootProps){
      const app = {
        mount(container){
          console.log(container);
        }
      }
      return app
    }
  }
}