
import { useState, useEffect } from 'react';

interface WebGLCapabilities {
  supported: boolean;
  highPerformance: boolean;
  shouldUseWebGL: boolean;
}

export const useWebGLSupport = (): WebGLCapabilities => {
  const [capabilities, setCapabilities] = useState<WebGLCapabilities>({
    supported: false,
    highPerformance: false,
    shouldUseWebGL: false,
  });

  useEffect(() => {
    const detectWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          return { supported: false, highPerformance: false, shouldUseWebGL: false };
        }

        // Performance-Tests
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        // Prüfe verfügbare Extensions (weniger restriktiv)
        const extensions = gl.getSupportedExtensions() || [];
        
        // Viel weniger restriktive Heuristik für High-Performance-Geräte
        const isHighPerformance = true; // Temporarily allow all devices
        
        // Debug logging
        console.log('WebGL Detection:', {
          renderer,
          vendor,
          userAgent: navigator.userAgent,
          isHighPerformance,
          extensions: extensions.length
        });

        const hasGoodExtensions = extensions.length > 10; // Basic extension check
        const shouldUse = isHighPerformance && hasGoodExtensions;

        return {
          supported: true,
          highPerformance: isHighPerformance,
          shouldUseWebGL: shouldUse,
        };
      } catch (error) {
        console.warn('WebGL detection failed:', error);
        return { supported: false, highPerformance: false, shouldUseWebGL: false };
      }
    };

    setCapabilities(detectWebGLSupport());
  }, []);

  return capabilities;
};
