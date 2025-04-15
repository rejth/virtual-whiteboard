import { mount } from 'svelte';
import App from 'client/App.svelte';

const rootElement = document.getElementById('app') as HTMLDivElement;

if (!rootElement) {
  throw new Error(
    'Root container was not found. Failed to mount the app. Please make sure the container exists and is in the DOM.',
  );
}

const app = mount(App, { target: rootElement });

export default app;
