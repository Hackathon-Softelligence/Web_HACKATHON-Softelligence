import { CheatingDetectionResult } from '@/src/models/CheatingDetectionResult';
import { FaceDetectionService } from '@/src/services/FaceDetectionService';
import React, { useRef, useEffect, useState, useImperativeHandle } from 'react'; // Import useImperativeHandle

interface CameraFeedProps {
  onCheatingDetected: (detection: CheatingDetectionResult) => void;
  isActive: boolean;
}

// Define the type for the ref object that will be exposed
export interface CameraFeedRef {
  takeSnapshot: () => string | null;
}

// Use React.forwardRef to allow this component to receive a ref
const CameraFeed = React.forwardRef<CameraFeedRef, CameraFeedProps>(
  ({ onCheatingDetected, isActive }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const [faceDetection] = useState(() => new FaceDetectionService());
    const [isDetectorInitialized, setIsDetectorInitialized] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Expose takeSnapshot function via the ref
    useImperativeHandle(ref, () => ({
      takeSnapshot: (): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8);
          }
        }
        return null;
      },
    }));

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
      if (isActive && isDetectorInitialized && isCameraReady) {
        startDetection();
      } else {
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

      const hasCheatingBehavior = detection.isLookingAway || detection.multipleFaces ||
        detection.noFaceDetected || detection.hasCheatingObjects;

      ctx.fillStyle = hasCheatingBehavior ? '#ff4444' : '#44ff44';

      let statusText = 'Học sinh nghiêm túc';
      if (detection.noFaceDetected) statusText = 'Không thấy khuôn mặt';
      else if (detection.multipleFaces) statusText = 'Phát hiện nhiều người xung quanh';
      else if (detection.lookingDown) statusText = 'Học sinh nhìn xuống';
      else if (detection.lookingLeft) statusText = 'Học sinh quay sang trái';
      else if (detection.lookingRight) statusText = 'Học sinh quay sang phải';
      else if (detection.isLookingAway) statusText = 'Học sinh nhìn ra ngoài';
      else if (detection.hasCheatingObjects) statusText = 'Phát hiện vật thể gian lận';

      ctx.fillText(statusText, 10, 30);
      ctx.fillText(`Confidence: ${(detection.confidence * 100).toFixed(1)}%`, 10, 55);

      if (detection.detectedObjects.length > 0) {
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px Arial';
        let yOffset = 80;

        detection.detectedObjects.forEach((obj, index) => {
          const objectText = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;
          ctx.fillText(objectText, 10, yOffset + (index * 20));

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
          onLoadedData={handleVideoLoaded}
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
  }
);

CameraFeed.displayName = 'CameraFeed'; // Good practice for debugging

export default CameraFeed;