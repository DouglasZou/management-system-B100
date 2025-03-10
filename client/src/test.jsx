import React from 'react';
import ReactDOM from 'react-dom';

// Simple component
const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '40px auto', 
      border: '1px solid #ddd', 
      borderRadius: '5px' 
    }}>
      <h1>React Test Page</h1>
      <p>If you can see this, React is working correctly.</p>
      <button 
        style={{
          padding: '10px 15px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
};

// Render directly to the body
const testRoot = document.createElement('div');
document.body.appendChild(testRoot);

try {
  ReactDOM.render(<TestApp />, testRoot);
  console.log('Test React app rendered successfully');
} catch (error) {
  console.error('Error rendering test React app:', error);
  
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.color = 'red';
  errorDiv.style.backgroundColor = '#ffeeee';
  errorDiv.style.border = '1px solid red';
  errorDiv.style.margin = '20px';
  
  errorDiv.innerHTML = `
    <h2>Test React App Error</h2>
    <p>${error.message}</p>
    <pre>${error.stack}</pre>
  `;
  
  document.body.appendChild(errorDiv);
} 