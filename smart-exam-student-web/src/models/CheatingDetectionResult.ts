export interface CheatingDetectionResult {
  isLookingAway: boolean;
  multipleFaces: boolean;
  noFaceDetected: boolean;
  lookingDown: boolean;
  lookingLeft: boolean;
  lookingRight: boolean;
  confidence: number;
  // Object detection properties
  detectedObjects: DetectedObject[];
  hasCheatingObjects: boolean;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
}