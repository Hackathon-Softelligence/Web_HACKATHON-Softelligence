export interface CheatingDetectionResult {
  isLookingAway: boolean;
  multipleFaces: boolean;
  noFaceDetected: boolean;
  lookingDown: boolean;
  lookingLeft: boolean;
  lookingRight: boolean;
  confidence: number;
}