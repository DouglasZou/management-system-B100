import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TestPage = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Page</h1>
      <p>This is a standalone test page outside the main application layout.</p>
      <p>ID from URL: <strong>{id}</strong></p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/clients">Back to Clients</Link>
      </div>
    </div>
  );
};

export default TestPage; 