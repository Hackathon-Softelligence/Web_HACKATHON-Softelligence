"use client"

import { CheatingDetectionResult } from '@/src/models/CheatingDetectionResult';
import { FaceDetectionService } from '@/src/services/FaceDetectionService';
import React, { useRef, useEffect, useState } from 'react';

interface CameraPreviewProps {
  onVerificationComplete: (success: boolean) => void;
  isActive: boolean;
}

// --- CONSTANTS FOR VERIFICATION LOGIC ---
// How long the user must have a "Normal" status to pass.
const VERIFICATION_SUCCESS_DURATION = 3000; // 3 seconds
// How long the entire verification attempt can last before timing out.
const VERIFICATION_TIMEOUT = 10000; // 10 seconds

const CameraPreview: React.FC<CameraPreviewProps> = ({ onVerificationComplete, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs to manage the verification process without causing re-renders
  const requestRef = useRef<number>();
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);
  const failureTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [faceDetection] = useState(() => new FaceDetectionService());
  const [isDetectorInitialized, setIsDetectorInitialized] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize services when the component mounts
  useEffect(() => {
    faceDetection.initialize().then(() => setIsDetectorInitialized(true));
    initializeCamera();
    
    return () => cleanup();
  }, []);

  // This powerful useEffect hook controls the entire verification lifecycle
  useEffect(() => {
    // When the parent asks us to start...
    if (isActive && isDetectorInitialized && isCameraReady) {
      startDetection();
      
      // Set a master timeout for the whole attempt.
      failureTimerRef.current = setTimeout(() => {
        console.error("Verification timed out.");
        onVerificationComplete(false);
      }, VERIFICATION_TIMEOUT);

    } else {
      // If isActive becomes false, stop everything.
      stopDetection();
    }

    // This cleanup function is CRITICAL. It runs when isActive changes or the component unmounts.
    return () => {
      stopDetection(); // Ensure animation frame is cancelled
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      // Reset timers for the next run
      failureTimerRef.current = null;
      successTimerRef.current = null;
    };
  }, [isActive, isDetectorInitialized, isCameraReady]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
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

  const startDetection = () => {
    const detectFrame = () => {
      if (!videoRef.current || !isActive) return; // Stop if we become inactive

      const detection = faceDetection.analyzeCheating(videoRef.current, performance.now());
      const statusText = getStatusText(detection);

      // --- ROBUST VERIFICATION LOGIC ---
      if (statusText === 'Normal') {
        // If we get a "Normal" frame and our success timer isn't already running, start it.
        if (!successTimerRef.current) {
          successTimerRef.current = setTimeout(() => {
            console.log("Verification SUCCEEDED after 3 seconds of stability.");
            onVerificationComplete(true);
          }, VERIFICATION_SUCCESS_DURATION);
        }
      } else {
        // If a non-Normal frame is detected, it means the user moved. Reset the success timer.
        if (successTimerRef.current) {
          clearTimeout(successTimerRef.current);
          successTimerRef.current = null;
        }
      }
      
      drawDetectionOverlay(detection, statusText);
      requestRef.current = requestAnimationFrame(detectFrame);
    };
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const stopDetection = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };
  
  const getStatusText = (detection: CheatingDetectionResult): string => {
    if (detection.noFaceDetected) return 'No Face Detected';
    if (detection.multipleFaces) return 'Multiple Faces';
    if (detection.lookingDown) return 'Looking Down';
    if (detection.lookingLeft) return 'Looking Left';
    if (detection.lookingRight) return 'Looking Right';
    if (detection.isLookingAway) return 'Looking Away';
    if (detection.hasCheatingObjects) return 'Cheating Objects Detected';
    return 'Normal';
  }
  
  // This function is now ONLY responsible for drawing. No more application logic!
  const drawDetectionOverlay = (detection: CheatingDetectionResult, statusText: string) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = statusText !== 'Normal' ? '#ff4444' : '#44ff44';
    
    ctx.fillText(statusText, 10, 25);
    
    // Display detected objects
    if (detection.detectedObjects.length > 0) {
      ctx.fillStyle = '#ff4444';
      ctx.font = '14px Arial';
      let yOffset = 45;
      
      detection.detectedObjects.forEach((obj, index) => {
        const objectText = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;
        ctx.fillText(objectText, 10, yOffset + (index * 18));
        
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
    stopDetection();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onLoadedData={() => setIsCameraReady(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
};

export default CameraPreview;