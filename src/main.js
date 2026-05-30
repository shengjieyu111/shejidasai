import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './portal.css'
import './pageTransition.css'
import { setupPageTransitions } from './pageTransition.js'

const app = createApp(App)

app.use(router)
setupPageTransitions(router)
app.mount('#app')
