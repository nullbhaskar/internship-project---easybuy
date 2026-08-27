
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    #canvas-container { width: 300px; height: 300px; position: relative; display: flex; justify-content: center; align-items: center; }
    canvas { width: 100% !important; height: 100% !important; outline: none; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  
  <script>
    const container = document.getElementById('canvas-container');
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.5; // Zoomed in a bit more for the wireframe
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Absolute transparency, NO squares!
    container.appendChild(renderer.domElement);
    
    // The beautiful wireframe mesh
    // Icosahedron with detail 10 gives a very nice geometric grid
    const geo = new THREE.IcosahedronGeometry(1.0, 2);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x38D8D3, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.8
    });
    const orb = new THREE.Mesh(geo, mat);
    scene.add(orb);

    // Save original vertices for displacement animation
    const posAttr = geo.attributes.position;
    const originalVertices = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      originalVertices.push(v.clone());
    }

    let targetVolume = 0;
    let currentVolume = 0;
    let time = 0;
    
    function noise(x, y, z, t) {
       return Math.sin(x * 2.5 + t) * Math.cos(y * 2.5 + t) * Math.sin(z * 2.5 + t);
    }

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;
      
      currentVolume += (targetVolume - currentVolume) * 0.2;
      
      // Continuous geometric rotation
      orb.rotation.y += 0.002;
      orb.rotation.x += 0.001;
      orb.rotation.z += 0.0005;
      
      // Wireframe morphs and spikes with the audio beats
      const positions = geo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const orig = originalVertices[i];
        const speed = time * (1.0 + currentVolume * 1.5); 
        const n = noise(orig.x, orig.y, orig.z, speed);
        
        // Liquid wave + sharp spikes on audio beats
        const displacement = (0.02 * n) + (currentVolume * 0.3 * Math.max(0, n));
        
        v.copy(orig).normalize().multiplyScalar(1.0 + displacement);
        positions.setXYZ(i, v.x, v.y, v.z);
      }
      positions.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    window.updateOrbState = function(status, inputLength, volume) {
      if (status === 'THINKING') {
        targetVolume = 0.5; 
        mat.color.setHex(0x7129E6);
      } else if (status === 'LISTENING' || status === 'SPEAKING') {
        targetVolume = volume; 
        mat.color.setHex(status === 'LISTENING' ? 0x38D8D3 : 0xC89EBE);
      } else {
        targetVolume = inputLength > 0 ? 0.15 : 0;
        mat.color.setHex(0x38D8D3);
      }
    };
  </script>
</body>
</html>
`;

export const CSSOrbWebView = ({ status, inputTextLength, volume = 0 }: { status: string, inputTextLength: number, volume?: number }) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (webViewRef.current) {
      const script = `window.updateOrbState('${status}', ${inputTextLength}, ${volume}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [status, inputTextLength, volume]);

  if (Platform.OS === 'web') {
    useEffect(() => {
      const iframe = document.getElementById('orb-iframe') as any;
      if (iframe && iframe.contentWindow && iframe.contentWindow.updateOrbState) {
        iframe.contentWindow.updateOrbState(status, inputTextLength, volume);
      }
    }, [status, inputTextLength, volume]);

    return (
      <View style={[{ width: 300, height: 300, position: 'absolute' }]} pointerEvents="none">
        {/* @ts-ignore */}
        <iframe
          id="orb-iframe"
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent' }}
          scrolling="no"
        />
      </View>
    );
  }

  return (
    <View style={[{ width: 300, height: 300, position: 'absolute' }]} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ backgroundColor: 'transparent', flex: 1 }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
};
