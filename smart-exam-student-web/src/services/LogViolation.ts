import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheatingDetectionResult } from "../models/CheatingDetectionResult";
import { firestore, storage } from "@/firebase";
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const statusMap: { [key: string]: string } = {
  noFaceDetected: "Không thấy khuôn mặt",
  multipleFaces: "Phát hiện nhiều người xung quanh",
  lookingDown: "Học sinh quay xuống (Ngủ gật)",
  lookingLeft: "Học sinh quay sang trái",
  lookingRight: "Học sinh quay sang phải",
  hasCheatingObjects: "Phát hiện vật thể gian lận",
  isLookingAway: "Học sinh nhìn ra ngoài"
};

const getViolationStatus = (detection: CheatingDetectionResult): string => {
  if (detection.noFaceDetected) return statusMap.noFaceDetected;
  if (detection.multipleFaces) return statusMap.multipleFaces;
  if (detection.lookingDown) return statusMap.lookingDown;
  if (detection.lookingLeft) return statusMap.lookingLeft;
  if (detection.lookingRight) return statusMap.lookingRight;
  if (detection.hasCheatingObjects) return statusMap.hasCheatingObjects;
  if (detection.isLookingAway) return statusMap.isLookingAway;
  return "Hành vi đáng ngờ";
};


export const logViolation = async (detection: CheatingDetectionResult, imageDataUrl: string | null) => {
    if (!imageDataUrl) {
        console.error("No image data provided to log violation.");
        return;
    }

    const studentNo = "SE123456"; // Hardcoded as requested
    const logId = uuidv4(); // Generate a unique ID for the log and image
    const imagePath = `detection_logs/${studentNo}/${logId}.jpg`;

    try {
        // --- Upload Snapshot to Firebase Storage ---
        console.log("Uploading snapshot to:", imagePath);
        const storageRef = ref(storage, imagePath);
        
        // 'data_url' tells Firebase to expect a Base64 formatted string
        const uploadTask = await uploadString(storageRef, imageDataUrl, 'data_url');
        
        // Get the public URL of the file we just uploaded
        const imageUrl = await getDownloadURL(uploadTask.ref);
        console.log("Snapshot uploaded, URL:", imageUrl);

        // --- Push Log to Firestore ---
        console.log("Pushing log to Firestore...");
        const logData = {
            id: logId,
            studentNo: studentNo,
            name: "Nguyễn Văn A", // Hardcoded as requested
            status: getViolationStatus(detection),
            imageUrl: imageUrl, // The URL from Storage
            timestamp: serverTimestamp(), // Use the server's timestamp for accuracy
        };
        console.log(logData)

        // Create a reference to the subcollection where logs will be stored
        const newDocRef = doc(firestore, `detection_logs/${studentNo}/logs`, logId);
        
        // Add the new log documents
        try {
            const docRef = await setDoc(newDocRef, logData);
            console.log("Violation log successfully written with ID:", logId);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    } catch (error) {
        console.error("Error logging violation:", error);
    }
};