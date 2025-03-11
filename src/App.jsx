import { useState, useRef } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Tips from './components/Tips';
import './App.css';

function App() {
  const [modelVisible, setModelVisible] = useState(true);
  const [model, setModel] = useState(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (file) => {
    setModel(file);
  };

  const toggleModelVisibility = () => {
    setModelVisible(!modelVisible);
  };

  const fitModelToView = () => {
    if (canvasRef.current && canvasRef.current.fitToView) {
      canvasRef.current.fitToView();
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <LeftPanel onFileUpload={handleFileUpload} />
        <RightPanel 
          modelVisible={modelVisible} 
          toggleVisibility={toggleModelVisibility} 
          fitView={fitModelToView}
          model={model}
          canvasRef={canvasRef}
        />
      </div>
      <Tips />
    </div>
  );
}

export default App;