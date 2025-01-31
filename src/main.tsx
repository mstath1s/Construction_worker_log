import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Starting application initialization');

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

createRoot(rootElement!).render(
  <StrictMode>
    {console.log('Rendering App in StrictMode')}
    <App />
  </StrictMode>,
)

console.log('Application render initiated');
