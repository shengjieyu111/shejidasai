import { createApp } from 'vue'
import './style.css'
import '../../pageTransition.css'
import { setupPageTransitions } from '../../pageTransition.js'
import App from './App.vue'

setupPageTransitions()
createApp(App).mount('#app')
