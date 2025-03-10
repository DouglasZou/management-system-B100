import React from 'react';
import { useParams } from 'react-router-dom';

const DirectClientProfile = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Direct Client Profile</h1>
      <p>Client ID: <strong>{id}</strong></p>
    </div>
  );
};

export default DirectClientProfile; 