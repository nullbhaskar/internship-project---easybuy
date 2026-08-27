
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="shader-canvas"></canvas>
  <script>
    const canvas = document.getElementById('shader-canvas');
    function syncSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    const vs = \`attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }\`;
    const fs = \`precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
          vec2 uv = v_texCoord;
          vec2 centered_uv = (uv - 0.5) * 2.0;
          centered_uv.x *= u_resolution.x / u_resolution.y;
          float dist = length(centered_uv);
          
          float noise1 = snoise(centered_uv * 1.5 + u_time * 0.4);
          float noise2 = snoise(centered_uv * 3.0 - u_time * 0.6);
          float radius = 0.6 + noise1 * 0.15 + noise2 * 0.05;
          
          float orb = smoothstep(radius, radius - 0.05, dist);
          float detail = snoise(centered_uv * 4.0 + u_time * 0.8);
          detail = smoothstep(-0.2, 0.8, detail);
          
          vec3 col1 = vec3(0.13, 0.83, 0.93); 
          vec3 col2 = vec3(0.55, 0.36, 0.96); 
          vec3 col3 = vec3(0.93, 0.28, 0.60); 
          
          vec3 final_color = mix(col1, col2, uv.y + noise1 * 0.2);
          final_color = mix(final_color, col3, detail * 0.5);
          
          float fresnel = pow(1.0 - dist / radius, 2.0);
          final_color += col1 * fresnel * 0.5;
          
          float aura = smoothstep(radius + 0.4, radius, dist);
          vec3 aura_color = mix(col2, col3, noise2);
          
          float alpha = max(orb, aura * 0.4);
          gl_FragColor = vec4(final_color * orb + aura_color * aura * 0.4, alpha);
      }\`;
    
    function cs(type, src) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    function render(t) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }
    render(0);
  </script>
</body>
</html>
`;

export const LiquidOrbWebView = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.4 }] }]} pointerEvents="none">
      <WebView
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
