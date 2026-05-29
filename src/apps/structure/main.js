import { createApp } from 'vue';
import App from './App.vue';
import './assets/styles/base.css';
import '../../pageTransition.css';
import { setupPageTransitions } from '../../pageTransition.js';

setupPageTransitions();
createApp(App).mount('#app');
