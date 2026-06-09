import { createApp } from 'vue'
// Import Pinia
import { createPinia } from 'pinia' 
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Create Pinia instance
const pinia = createPinia() 

// Register Pinia and Router to the Vue application
app.use(pinia) 
app.use(router)
app.mount('#app')

