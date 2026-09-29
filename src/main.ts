import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './assets/main.css'
import QuestionBox from './components/QuestionBox.vue'
import router from './router'

const app = createApp(App)

app.component('QuestionBox', QuestionBox)

app.use(createPinia())
app.use(router)

app.mount('#app')
