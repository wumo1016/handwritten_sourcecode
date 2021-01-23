import install, {
  Vue
} from './install'
import Store from './store'

export default {
  install,
  Store
}

export function mapState(stateList) {
  const obj = {}
  for (let i = 0; i < stateList.length; i++) {
    const stateName = stateList[i]
    obj[stateName] = function () {
      return this.$store.state[stateName]
    }
  }
  return obj
}

export function mapGetters(getterList) {
  const obj = {}
  for (let i = 0; i < getterList.length; i++) {
    const getterName = getterList[i]
    obj[getterName] = function () {
      return this.$store.getters[getterName]
    }
  }
  return obj
}

export function mapMutations(commitList) {
  const obj = {}
  for (let i = 0; i < commitList.length; i++) {
    const commitName = commitList[i]
    obj[commitName] = function (payload) {
      return this.$store.commit(commitName, payload)
    }
  }
  return obj
}

export function mapActions(dispatchList) {
  const obj = {}
  for (let i = 0; i < dispatchList.length; i++) {
    const dispatchName = dispatchList[i]
    obj[dispatchName] = function (payload) {
      return this.$store.dispatch(dispatchName, payload)
    }
  }
  return obj
}