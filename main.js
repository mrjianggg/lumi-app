import App from './App'
import http from './utils/request.js'
import toast from './utils/toast.js'
import AppToast from './components/app-toast.vue'

// 导入字体
import '@fontsource/inter'
import '@fontsource/noto-sans-sc'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

// 将http请求工具挂载到Vue原型上，方便全局使用
Vue.prototype.$http = http
Vue.prototype.$toast = toast

// 全局注册AppToast组件
Vue.component('app-toast', AppToast)

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // Vue3 中将http请求工具设置为全局属性
  app.config.globalProperties.$http = http
  app.config.globalProperties.$toast = toast
  
  // 全局注册AppToast组件
  app.component('app-toast', AppToast)
  
  return {
    app
  }
}
// #endif