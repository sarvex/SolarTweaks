import { remote as electron } from 'electron';
import settings from 'electron-settings';
import { createApp } from 'vue';
import App from './App.vue';
import constants from './constants';
import store from './store';

import * as Sentry from '@sentry/vue';

import Cache from './javascript/cache';
export const cache = new Cache();

const app = createApp(App).use(store).mount('#app');

if (electron.app.isPackaged) {
  console.log('App is packaged, initializing Sentry...');
  Sentry.init({
    app,
    dsn: constants.SENTRY,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    async beforeSend(event) {
      return (await settings.get('SentryEnabled')) ? event : null;
    },
    attachStacktrace: true,
    release: electron.app.getVersion(),
    ignoreErrors: [/AxiosError: Network Error/i],
    logErrors: true,
  });
} else console.log('App is not packaged, not initializing Sentry.');
