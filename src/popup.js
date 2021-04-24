import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import 'babel-polyfill'
import './static/less/reset.less'
import './static/less/index.less'
import {
  Button,
  ButtonGroup,
  Cascader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Input,
  Loading,
  Message,
  Option,
  Select,
  Switch,
  Tabs,
  TabPane,
  Tooltip,
  Progress
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Main from './components/main.vue'


Vue.config.devtools = true
Vue.use(VueRouter)
Vue.use(Input)
Vue.use(Dropdown)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Select)
Vue.use(Option)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Loading)
Vue.use(Cascader)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Tooltip)
Vue.use(Switch)
Vue.use(Progress)
Vue.component(Message)
Vue.prototype.$message = Message;

const h = new Vue().$createElement
let _render = Vue.prototype._render

Vue.prototype._render = function (...args) {
    try {
        return _render.apply(this, args)
    } catch (e) {
        console.error('Error when render called : ', e)
        return h()
    }
}
const router = new VueRouter({
  mode: 'hash',
  routes,
  base: '/'
})
window.Router = router

new Vue({
  el: '#app',
  render: h => h(Main),
  router: router,
})



