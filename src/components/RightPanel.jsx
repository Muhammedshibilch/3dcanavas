import ThreeCanvas from './ThreeCanvas';
import Controls from './Controls';

function RightPanel({ modelVisible, toggleVisibility, fitView, model, canvasRef }) {
  return (
    <div className="right-panel" style={{backgroundColor:"yellow"}}>
      <div className="canvas-container">
        <div className="canvas-label">3D CANVAS</div>
        <ThreeCanvas  
          model={model} 
          isVisible={modelVisible} 
          ref={canvasRef} 
        />
        <Controls 
          toggleVisibility={toggleVisibility} 
          fitView={fitView} 
        />
      </div>
    </div>
  );
}

export default RightPanel;