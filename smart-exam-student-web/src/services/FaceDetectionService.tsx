import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { CheatingDetectionResult } from '../models/CheatingDetectionResult';

export class FaceDetectionService {
    private faceLandmarker: FaceLandmarker | null = null;
    private isInitialized = false;

    async initialize() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            
            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                },
                runningMode: "VIDEO",
                numFaces: 3, // Detect up to 3 faces to catch multiple people
                minFaceDetectionConfidence: 0.5,
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.isInitialized = true;
            console.log("Face detection initialized successfully");
        } catch (error) {
            console.error("Failed to initialize face detection:", error);
        }
    }

    analyzeCheating(videoElement: HTMLVideoElement, timestamp: number): CheatingDetectionResult {
        if (!this.faceLandmarker || !this.isInitialized) {
            return {
                isLookingAway: false,
                multipleFaces: false,
                noFaceDetected: true,
                lookingDown: false,
                lookingLeft: false,
                lookingRight: false,
                confidence: 0
            };
        }

        try {
        const results = this.faceLandmarker.detectForVideo(videoElement, timestamp);
        return this.processResults(results);
        } catch (error) {
        console.error("Face detection error:", error);
        return {
            isLookingAway: false,
            multipleFaces: false,
            noFaceDetected: true,
            lookingDown: false,
            lookingLeft: false,
            lookingRight: false,
            confidence: 0
        };
        }
    }

    private processResults(results: FaceLandmarkerResult): CheatingDetectionResult {
        const faces = results.faceLandmarks;
        
        // No face detected
        if (faces.length === 0) {
        return {
            isLookingAway: true,
            multipleFaces: false,
            noFaceDetected: true,
            lookingDown: false,
            lookingLeft: false,
            lookingRight: false,
            confidence: 0
        };
        }

        // Multiple faces detected
        if (faces.length > 1) {
        return {
            isLookingAway: false,
            multipleFaces: true,
            noFaceDetected: false,
            lookingDown: false,
            lookingLeft: false,
            lookingRight: false,
            confidence: 1.0
        };
        }

        // Analyze single face for head pose
        const face = faces[0];
        const headPose = this.calculateHeadPose(face);
        
        return {
            isLookingAway: headPose.isLookingAway,
            multipleFaces: false,
            noFaceDetected: false,
            lookingDown: headPose.lookingDown,
            lookingLeft: headPose.lookingLeft,
            lookingRight: headPose.lookingRight,
            confidence: headPose.confidence
        };
    }

    private calculateHeadPose(landmarks: any[]) {
        // Key landmark indices for head pose estimation
        const nose = landmarks[1]; // Nose tip
        const leftEye = landmarks[33]; // Left eye corner
        const rightEye = landmarks[263]; // Right eye corner
        const chin = landmarks[175]; // Chin

        // Calculate eyes distance
        const eyeDistance = Math.abs(leftEye.x - rightEye.x);

        // --- Symmetrical and realistic thresholds ---
        const HORIZONTAL_THRESHOLD = 0.2;
        const LOOKING_DOWN_THRESHOLD = 0.75;
        const LOOKING_UP_THRESHOLD = -0.1;

        const horizontalRatio = (nose.x - (leftEye.x + rightEye.x) / 2) / eyeDistance;
        const verticalRatio = (nose.y - (leftEye.y + rightEye.y) / 2) / eyeDistance;

        // Define thresholds
        const lookingLeft = horizontalRatio > HORIZONTAL_THRESHOLD;
        const lookingRight = horizontalRatio < -HORIZONTAL_THRESHOLD;
        const lookingDown = verticalRatio > LOOKING_DOWN_THRESHOLD;
        const lookingUp = verticalRatio < LOOKING_UP_THRESHOLD;
        
        // User is looking away when distance between eyes are 0
        if (eyeDistance === 0) {
            return { 
                isLookingAway: true, 
                lookingDown: false, 
                lookingLeft: false, 
                lookingRight: false, 
                confidence: Math.min(Math.abs(horizontalRatio) + Math.abs(verticalRatio), 1.0)
            };
        }

        // Decide if user is not focus
        const isLookingAway = lookingLeft || lookingRight || lookingDown || lookingUp;
        
        return {
            isLookingAway,
            lookingDown,
            lookingLeft,
            lookingRight,
            confidence: Math.min(Math.abs(horizontalRatio) + Math.abs(verticalRatio), 1.0)
        };
    }
}