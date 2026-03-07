import './styles/main.css';
import { AlchemyApp } from './app';

declare global {
  interface Window {
    ALCHEMY_APP?: AlchemyApp;
  }
}

const appRoot = document.querySelector<HTMLElement>('#app');

if (!appRoot) {
  throw new Error('Missing app root.');
}

window.ALCHEMY_APP = new AlchemyApp(appRoot);
