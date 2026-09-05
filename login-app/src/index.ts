import { createApp } from 'vue';
import './index.css';
import router from './router/web.ts';
import App from './App.vue';

let app = createApp(App)

app.use(router)
app.mount('#root');
