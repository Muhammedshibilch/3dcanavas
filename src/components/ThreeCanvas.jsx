import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const ThreeCanvas = forwardRef(({ model, isVisible }, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const boundingBoxRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (
        mountRef.current &&
        cameraRef.current &&
        rendererRef.current
      ) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.isMesh) {
            object.geometry?.dispose();
            object.material?.dispose();
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!model || !sceneRef.current) return;

    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose();
          object.material?.dispose();
        }
      });
      modelRef.current = null;
    }

    const fileURL = URL.createObjectURL(model);
    const fileExtension = model.name.split('.').pop().toLowerCase();

    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      const loader = new GLTFLoader();

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        fileURL,
        (gltf) => {
          modelRef.current = gltf.scene;
          sceneRef.current.add(modelRef.current);
          
          boundingBoxRef.current = new THREE.Box3().setFromObject(modelRef.current);
          
          const center = new THREE.Vector3();
          boundingBoxRef.current.getCenter(center);
          modelRef.current.position.sub(center);
          
          fitToView();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading GLTF model:', error);
        }
      );
    } else if (fileExtension === 'obj') {
      const loader = new OBJLoader();
      loader.load(
        fileURL,
        (obj) => {
          modelRef.current = obj;
          sceneRef.current.add(modelRef.current);
          
          boundingBoxRef.current = new THREE.Box3().setFromObject(modelRef.current);
          
          const center = new THREE.Vector3();
          boundingBoxRef.current.getCenter(center);
          modelRef.current.position.sub(center);
          
          fitToView();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading OBJ model:', error);
        }
      );
    }

    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, [model]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.visible = isVisible;
    }
  }, [isVisible]);

  const fitToView = () => {
    if (
      modelRef.current &&
      boundingBoxRef.current &&
      cameraRef.current &&
      controlsRef.current
    ) {
      boundingBoxRef.current.setFromObject(modelRef.current);
      
      const center = new THREE.Vector3();
      boundingBoxRef.current.getCenter(center);
      
      const size = new THREE.Vector3();
      boundingBoxRef.current.getSize(size);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov * (Math.PI / 250);
      let cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
      
      cameraDistance *= 1.2;
      
      const offset = new THREE.Vector3(0, 0, cameraDistance);
      cameraRef.current.position.copy(offset);
      cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
      
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  useImperativeHandle(ref, () => ({
    fitToView
  }));

  return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
});

export default ThreeCanvas;