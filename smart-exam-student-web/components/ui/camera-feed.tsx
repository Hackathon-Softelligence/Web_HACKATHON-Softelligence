import { CheatingDetectionResult } from '@/src/models/CheatingDetectionResult';
import { FaceDetectionService } from '@/src/services/FaceDetectionService';
import React, { useRef, useEffect, useState } from 'react';

interface CameraFeedProps {
  onCheatingDetected: (detection: CheatingDetectionResult) => void;
  isActive: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCheatingDetected, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(); // To hold the animation frame request
  const [faceDetection] = useState(() => new FaceDetectionService());
  const [isDetectorInitialized, setIsDetectorInitialized] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false); // <-- New state
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize camera and face detection on mount
  useEffect(() => {
    initializeCamera();
    initializeFaceDetection();
    
    return () => {
      cleanup();
    };
  }, []);

  // Start or stop detection based on isActive and readiness
  useEffect(() => {
    // Only start if all conditions are met
    if (isActive && isDetectorInitialized && isCameraReady) {
      startDetection();
    } else {
      // Stop the animation loop if isActive becomes false
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
  }, [isActive, isDetectorInitialized, isCameraReady]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const initializeFaceDetection = async () => {
    await faceDetection.initialize();
    setIsDetectorInitialized(true);
  };

  const startDetection = () => {
    const detectFrame = () => {
      // Double check refs and active state inside the loop
      if (videoRef.current && isActive) {
        const timestamp = performance.now();
        const detection = faceDetection.analyzeCheating(videoRef.current, timestamp);
        onCheatingDetected(detection);
        
        drawDetectionOverlay(detection);
        
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    };
    
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const handleVideoLoaded = () => {
    console.log('Camera feed loaded and ready.');
    setIsCameraReady(true);
  };

  const drawDetectionOverlay = (detection: CheatingDetectionResult) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '16px Arial';
    
    // Check for any cheating behavior (face or object detection)
    const hasCheatingBehavior = detection.isLookingAway || detection.multipleFaces || 
                               detection.noFaceDetected || detection.hasCheatingObjects;
    
    ctx.fillStyle = hasCheatingBehavior ? '#ff4444' : '#44ff44';
    
    let statusText = 'Normal';
    if (detection.noFaceDetected) statusText = 'No Face Detected';
    else if (detection.multipleFaces) statusText = 'Multiple Faces';
    else if (detection.lookingDown) statusText = 'Looking Down';
    else if (detection.lookingLeft) statusText = 'Looking Left';
    else if (detection.lookingRight) statusText = 'Looking Right';
    else if (detection.isLookingAway) statusText = 'Looking Away';
    else if (detection.hasCheatingObjects) statusText = 'Cheating Objects Detected';
    
    ctx.fillText(statusText, 10, 30);
    ctx.fillText(`Confidence: ${(detection.confidence * 100).toFixed(1)}%`, 10, 55);
    
    // Display detected objects
    if (detection.detectedObjects.length > 0) {
      ctx.fillStyle = '#ff4444';
      ctx.font = '14px Arial';
      let yOffset = 80;
      
      detection.detectedObjects.forEach((obj, index) => {
        const objectText = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;
        ctx.fillText(objectText, 10, yOffset + (index * 20));
        
        // Draw bounding box for detected objects
        if (obj.boundingBox) {
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;
          
          ctx.strokeStyle = '#ff4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            obj.boundingBox.originX * scaleX,
            obj.boundingBox.originY * scaleY,
            obj.boundingBox.width * scaleX,
            obj.boundingBox.height * scaleY
          );
        }
      });
    }
  };

  const cleanup = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div style={{ position: 'relative', width: '520px', height: '360px' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onLoadedData={handleVideoLoaded} // <-- Use React's event handler
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px',
          border: '2px solid #ddd'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default CameraFeed;