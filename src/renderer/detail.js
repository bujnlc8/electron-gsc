import Vue from 'vue'
import axios from 'axios'

import DetailApp from './DetailApp'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
  components: { DetailApp },
  template: '<DetailApp/>'
}).$mount('#app')