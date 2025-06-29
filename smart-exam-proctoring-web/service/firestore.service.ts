import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  collectionGroup,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface FirestoreStudent {
  id: string;
  imageUrl: string;
  name: string;
  status: string;
  studentNo: string;
  timestamp: Date;
}

export interface FirestoreStudentData {
  imageUrl: string;
  name: string;
  status: string;
  studentNo: string;
  timestamp: Timestamp;
}

export interface DetectionLog {
  id: string;
  imageUrl: string;
  name: string;
  status: string;
  studentNo: string;
  timestamp: Date;
  [key: string]: any; // Cho phép các field khác
}

class FirestoreService {
  private mainCollection = "detection_logs";
  private subCollection = "logs";

  // Lấy tất cả logs từ document SE123456
  async getLogsByStudentId(
    studentId: string = "SE123456"
  ): Promise<DetectionLog[]> {
    try {
      console.log("=== FIRESTORE SERVICE: getLogsByStudentId ===");
      console.log(`Fetching logs for student: ${studentId}`);

      // Tạo reference đến subcollection logs trong document SE123456
      const logsRef = collection(
        db,
        this.mainCollection,
        studentId,
        this.subCollection
      );
      console.log(
        "Collection path:",
        `${this.mainCollection}/${studentId}/${this.subCollection}`
      );

      const querySnapshot = await getDocs(logsRef);
      console.log("Query snapshot size:", querySnapshot.size);

      const logs: DetectionLog[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`--- Processing document ${doc.id} ---`);
        console.log("Raw document data:", data);

        // Handle timestamp safely
        let timestamp: Date;
        try {
          console.log(
            `Processing timestamp for document ${doc.id}:`,
            data.timestamp,
            "Type:",
            typeof data.timestamp
          );

          if (data.timestamp) {
            if (
              data.timestamp.toDate &&
              typeof data.timestamp.toDate === "function"
            ) {
              // Firestore Timestamp object
              console.log("Converting Firestore Timestamp to Date");
              timestamp = data.timestamp.toDate();
              console.log("Converted timestamp:", timestamp);
            } else if (data.timestamp instanceof Date) {
              // Already a Date object
              console.log(
                "Timestamp is already a Date object:",
                data.timestamp
              );
              timestamp = data.timestamp;
            } else if (typeof data.timestamp === "string") {
              // String timestamp
              console.log("Parsing string timestamp:", data.timestamp);
              timestamp = new Date(data.timestamp);
              console.log("Parsed timestamp:", timestamp);
            } else if (typeof data.timestamp === "number") {
              // Unix timestamp
              console.log("Converting Unix timestamp:", data.timestamp);
              timestamp = new Date(data.timestamp);
              console.log("Converted timestamp:", timestamp);
            } else if (
              data.timestamp &&
              typeof data.timestamp === "object" &&
              "seconds" in data.timestamp
            ) {
              // Firestore Timestamp with seconds/nanoseconds
              console.log("Converting seconds timestamp:", data.timestamp);
              timestamp = new Date(data.timestamp.seconds * 1000);
              console.log("Converted timestamp:", timestamp);
            } else {
              // Fallback to current time
              console.warn(
                "Unknown timestamp format, using current time:",
                data.timestamp
              );
              timestamp = new Date();
            }

            // Validate the timestamp
            if (isNaN(timestamp.getTime())) {
              console.warn(
                "Invalid timestamp after processing, using current time:",
                timestamp
              );
              timestamp = new Date();
            }
          } else {
            // No timestamp, use current time
            console.warn("No timestamp found, using current time");
            timestamp = new Date();
          }
        } catch (error) {
          console.error(
            "Error processing timestamp for document",
            doc.id,
            ":",
            error
          );
          timestamp = new Date();
        }

        const log: DetectionLog = {
          id: doc.id,
          imageUrl: data.imageUrl || "",
          name: data.name || "",
          status: data.status || "",
          studentNo: data.studentNo || studentId,
          timestamp: timestamp,
          ...data, // Include all other fields
        };

        console.log("Processed log object:", log);
        logs.push(log);
      });

      console.log(`=== FIRESTORE SERVICE: RESULT ===`);
      console.log(`Found ${logs.length} logs for student ${studentId}:`, logs);
      console.log("Final logs array:", JSON.stringify(logs, null, 2));

      // Sort logs by timestamp (newest first)
      logs.sort((a, b) => {
        try {
          // Check if timestamps are valid Date objects
          if (
            !(a.timestamp instanceof Date) ||
            !(b.timestamp instanceof Date)
          ) {
            console.warn("Invalid timestamp found during sorting:", {
              a: a.timestamp,
              b: b.timestamp,
              aType: typeof a.timestamp,
              bType: typeof b.timestamp,
            });
            return 0; // Keep original order if invalid
          }

          return b.timestamp.getTime() - a.timestamp.getTime(); // Descending order (newest first)
        } catch (error) {
          console.error("Error sorting logs by timestamp:", error);
          return 0; // Keep original order if error
        }
      });

      console.log("Sorted logs by timestamp (newest first):", logs);
      return logs;
    } catch (error) {
      console.error(`=== FIRESTORE SERVICE: ERROR ===`);
      console.error(`Error getting logs for student ${studentId}:`, error);
      throw error;
    }
  }

  // Lấy logs với realtime updates
  subscribeToLogs(
    studentId: string = "SE123456",
    callback: (logs: DetectionLog[]) => void
  ): () => void {
    console.log(`Setting up realtime subscription for student: ${studentId}`);

    const logsRef = collection(
      db,
      this.mainCollection,
      studentId,
      this.subCollection
    );
    const q = query(logsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const logs: DetectionLog[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Handle timestamp safely
          let timestamp: Date;
          try {
            console.log(
              `Processing timestamp for document ${doc.id}:`,
              data.timestamp,
              "Type:",
              typeof data.timestamp
            );

            if (data.timestamp) {
              if (
                data.timestamp.toDate &&
                typeof data.timestamp.toDate === "function"
              ) {
                // Firestore Timestamp object
                console.log("Converting Firestore Timestamp to Date");
                timestamp = data.timestamp.toDate();
                console.log("Converted timestamp:", timestamp);
              } else if (data.timestamp instanceof Date) {
                // Already a Date object
                console.log(
                  "Timestamp is already a Date object:",
                  data.timestamp
                );
                timestamp = data.timestamp;
              } else if (typeof data.timestamp === "string") {
                // String timestamp
                console.log("Parsing string timestamp:", data.timestamp);
                timestamp = new Date(data.timestamp);
                console.log("Parsed timestamp:", timestamp);
              } else if (typeof data.timestamp === "number") {
                // Unix timestamp
                console.log("Converting Unix timestamp:", data.timestamp);
                timestamp = new Date(data.timestamp);
                console.log("Converted timestamp:", timestamp);
              } else if (
                data.timestamp &&
                typeof data.timestamp === "object" &&
                "seconds" in data.timestamp
              ) {
                // Firestore Timestamp with seconds/nanoseconds
                console.log("Converting seconds timestamp:", data.timestamp);
                timestamp = new Date(data.timestamp.seconds * 1000);
                console.log("Converted timestamp:", timestamp);
              } else {
                // Fallback to current time
                console.warn(
                  "Unknown timestamp format, using current time:",
                  data.timestamp
                );
                timestamp = new Date();
              }

              // Validate the timestamp
              if (isNaN(timestamp.getTime())) {
                console.warn(
                  "Invalid timestamp after processing, using current time:",
                  timestamp
                );
                timestamp = new Date();
              }
            } else {
              // No timestamp, use current time
              console.warn("No timestamp found, using current time");
              timestamp = new Date();
            }
          } catch (error) {
            console.error(
              "Error processing timestamp for document",
              doc.id,
              ":",
              error
            );
            timestamp = new Date();
          }

          logs.push({
            id: doc.id,
            imageUrl: data.imageUrl || "",
            name: data.name || "",
            status: data.status || "",
            studentNo: data.studentNo || studentId,
            timestamp: timestamp,
            ...data, // Include all other fields
          });
        });

        console.log(`Realtime update for student ${studentId}:`, logs);

        // Sort logs by timestamp (newest first)
        logs.sort((a, b) => {
          try {
            // Check if timestamps are valid Date objects
            if (
              !(a.timestamp instanceof Date) ||
              !(b.timestamp instanceof Date)
            ) {
              console.warn("Invalid timestamp found during sorting:", {
                a: a.timestamp,
                b: b.timestamp,
                aType: typeof a.timestamp,
                bType: typeof b.timestamp,
              });
              return 0; // Keep original order if invalid
            }

            return b.timestamp.getTime() - a.timestamp.getTime(); // Descending order (newest first)
          } catch (error) {
            console.error("Error sorting logs by timestamp:", error);
            return 0; // Keep original order if error
          }
        });

        console.log("Sorted realtime logs by timestamp (newest first):", logs);
        callback(logs);
      },
      (error) => {
        console.error(
          `Error listening to logs for student ${studentId}:`,
          error
        );
      }
    );

    return unsubscribe;
  }

  // Thêm log mới vào document SE123456
  async addLog(
    logData: Omit<DetectionLog, "id">,
    studentId: string = "SE123456"
  ): Promise<string> {
    try {
      console.log(`Adding log for student: ${studentId}`, logData);

      const logsRef = collection(
        db,
        this.mainCollection,
        studentId,
        this.subCollection
      );
      const docRef = await addDoc(logsRef, {
        ...logData,
        timestamp: Timestamp.fromDate(logData.timestamp),
      });

      console.log(`Added log with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding log for student ${studentId}:`, error);
      throw error;
    }
  }

  // Lấy tất cả students (legacy method - giữ lại để tương thích)
  async getAllStudents(): Promise<FirestoreStudent[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.mainCollection));
      const students: FirestoreStudent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreStudentData;
        students.push({
          id: doc.id,
          imageUrl: data.imageUrl || "",
          name: data.name || "",
          status: data.status || "",
          studentNo: data.studentNo || "",
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });

      return students;
    } catch (error) {
      console.error("Error getting students:", error);
      throw error;
    }
  }

  // Lấy student theo ID
  async getStudentById(id: string): Promise<FirestoreStudent | null> {
    try {
      const docRef = doc(db, this.mainCollection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreStudentData;
        return {
          id: docSnap.id,
          imageUrl: data.imageUrl || "",
          name: data.name || "",
          status: data.status || "",
          studentNo: data.studentNo || "",
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting student:", error);
      throw error;
    }
  }

  // Thêm student mới (legacy method)
  async addStudent(studentData: Omit<FirestoreStudent, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.mainCollection), {
        ...studentData,
        timestamp: Timestamp.fromDate(studentData.timestamp),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding student:", error);
      throw error;
    }
  }

  // Cập nhật student
  async updateStudent(
    id: string,
    studentData: Partial<FirestoreStudent>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.mainCollection, id);
      const updateData: any = { ...studentData };

      if (studentData.timestamp) {
        updateData.timestamp = Timestamp.fromDate(studentData.timestamp);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  }

  // Xóa student
  async deleteStudent(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.mainCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  }

  // Lắng nghe thay đổi realtime (legacy method)
  subscribeToStudents(
    callback: (students: FirestoreStudent[]) => void
  ): () => void {
    const q = query(
      collection(db, this.mainCollection),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const students: FirestoreStudent[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreStudentData;
          students.push({
            id: doc.id,
            imageUrl: data.imageUrl || "",
            name: data.name || "",
            status: data.status || "",
            studentNo: data.studentNo || "",
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          });
        });

        callback(students);
      },
      (error) => {
        console.error("Error listening to students:", error);
      }
    );

    return unsubscribe;
  }

  // Lắng nghe thay đổi của một student cụ thể
  subscribeToStudent(
    id: string,
    callback: (student: FirestoreStudent | null) => void
  ): () => void {
    const docRef = doc(db, this.mainCollection, id);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as FirestoreStudentData;
          const student: FirestoreStudent = {
            id: doc.id,
            imageUrl: data.imageUrl || "",
            name: data.name || "",
            status: data.status || "",
            studentNo: data.studentNo || "",
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          };
          callback(student);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error listening to student:", error);
      }
    );

    return unsubscribe;
  }
}

export const firestoreService = new FirestoreService();
