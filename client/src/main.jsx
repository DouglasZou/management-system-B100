import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('Starting application...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('Root element found:', !!root);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error rendering application:', error);
  
  // Display error on page
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.color = 'red';
  errorDiv.style.backgroundColor = '#ffeeee';
  errorDiv.style.border = '1px solid red';
  errorDiv.style.borderRadius = '5px';
  errorDiv.style.margin = '20px';
  
  errorDiv.innerHTML = `
    <h2>Application Error</h2>
    <p>${error.message}</p>
    <pre>${error.stack}</pre>
  `;
  
  document.body.appendChild(errorDiv);
}
