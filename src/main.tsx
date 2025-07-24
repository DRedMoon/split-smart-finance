import React from 'react';
import { createRoot } from 'react-dom/client'

console.log('🚀 main.tsx: Starting app initialization');

try {
  console.log('🚀 main.tsx: Importing App component');
  import('./App.tsx').then(async (module) => {
    const App = module.default;
    console.log('🚀 main.tsx: App component imported successfully');
    
    console.log('🚀 main.tsx: Importing index.css');
    await import('./index.css');
    console.log('🚀 main.tsx: index.css imported successfully');

    console.log('🚀 main.tsx: Getting root element');
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    console.log('🚀 main.tsx: Root element found');

    console.log('🚀 main.tsx: Creating React root');
    const root = createRoot(rootElement);
    console.log('🚀 main.tsx: React root created');

    console.log('🚀 main.tsx: Rendering app');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('🚀 main.tsx: App rendered successfully');
  });
} catch (error) {
  console.error('❌ main.tsx: Fatal error during app initialization:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial; color: red;">
      <h1>App Initialization Error</h1>
      <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
      <p>Check console for details</p>
    </div>
  `;
}
