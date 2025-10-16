// frontend/src/components/TemplateCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function TemplateCard({ id, name }) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '200px',
    height: '200px',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
  };

  const thumbnailStyle = {
    flexGrow: 1,
    backgroundColor: '#e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#adb5bd',
    fontSize: '14px',
  };

  const nameStyle = {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #ddd',
    fontWeight: '500',
    textAlign: 'center',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  return (
    <div 
      style={cardStyle} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={thumbnailStyle}>
        <span>Thumbnail Preview</span>
      </div>
      <div style={nameStyle}>{name}</div>
      <div style={overlayStyle}>
        <Link to={`/generate/${id}`} style={buttonStyle}>
          Use Template
        </Link>
      </div>
    </div>
  );
}

export default TemplateCard;