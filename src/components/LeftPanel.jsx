import React from 'react'

function LeftPanel({ onFileUpload }) {
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onFileUpload(file);
      }
    };
  
    return (
      <div className="left-panel" style={{backgroundColor:"yellow"}}>
        <div className="file-upload">
          <div className="file-label">LOAD</div>
          <svg 
            className="file-icon" 
            viewBox="0 0 24 24" 
            onClick={() => document.getElementById('fileInput').click()}
          >
            <path fill="none" stroke="black" strokeWidth="1.5" d="M3,21 L21,21 L21,8 L14,1 L3,1 L3,21 Z"></path>
            <path fill="none" stroke="black" strokeWidth="1.5" d="M14,1 L14,8 L21,8"></path>
            <path fill="none" stroke="black" strokeWidth="1.5" d="M12,14 L12,10"></path>
            <path fill="none" stroke="black" strokeWidth="1.5" d="M9,12 L12,9 L15,12"></path>
          </svg>
          <input 
            type="file" 
            id="fileInput" 
            accept=".gltf,.glb,.obj" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <div className="arrow">↓</div>
          <div className="upload-text">
            Select file<br />from Local<br />Folder
          </div>
        </div>
      </div>
    );
  }
  
  export default LeftPanel;
  