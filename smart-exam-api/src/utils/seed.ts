import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../models/Student";
import Alert from "../models/Alert";
import Exam from "../models/Exam";
import Question from "../models/Question";
import Submission from "../models/Submission";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "smartexamdb" });

    // Clear existing data
    await Student.deleteMany({});
    await Exam.deleteMany({});
    await Question.deleteMany({});
    await Submission.deleteMany({});
    await Alert.deleteMany({});

    // Create 10 students
    const students = await Student.insertMany([
      {
        name: "Nguyễn Văn An",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Trần Thị Bình",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Lê Hoàng Cường",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Phạm Thị Dung",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Hoàng Văn Em",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Vũ Thị Phương",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Đỗ Minh Giang",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Ngô Thị Hương",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Lý Văn Inh",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      {
        name: "Đặng Thị Kim",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
    ]);

    console.log(
      "Created 10 students:",
      students.map((s) => s.name)
    );

    // Create multiple exams
    const exams = await Exam.insertMany([
      {
        name: "AI Midterm Exam",
        startTime: new Date(Date.now() + 3600_000), // 1 hour from now
        endTime: new Date(Date.now() + 7200_000), // 2 hours from now
        candidates: students.map((s) => s._id),
        status: "upcoming",
        room: "Online - Room A",
      },
      {
        name: "Machine Learning Final",
        startTime: new Date(Date.now() + 86400_000), // 1 day from now
        endTime: new Date(Date.now() + 90000_000), // 1 day + 1 hour from now
        candidates: students.slice(0, 7).map((s) => s._id), // First 7 students
        status: "upcoming",
        room: "Online - Room B",
      },
      {
        name: "Data Science Quiz",
        startTime: new Date(Date.now() - 3600_000), // 1 hour ago
        endTime: new Date(Date.now() + 1800_000), // 30 minutes from now
        candidates: students.slice(3, 10).map((s) => s._id), // Last 7 students
        status: "ongoing",
        room: "Online - Room C",
      },
      {
        name: "Python Programming Test",
        startTime: new Date(Date.now() - 86400_000), // 1 day ago
        endTime: new Date(Date.now() - 82800_000), // 1 day ago + 1 hour
        candidates: students.slice(0, 5).map((s) => s._id), // First 5 students
        status: "finished",
        room: "Online - Room D",
      },
      {
        name: "Database Systems Exam",
        startTime: new Date(Date.now() - 172800_000), // 2 days ago
        endTime: new Date(Date.now() - 165600_000), // 2 days ago + 2 hours
        candidates: students.slice(5, 10).map((s) => s._id), // Last 5 students
        status: "finished",
        room: "Online - Room E",
      },
    ]);

    console.log(
      "Created 5 exams:",
      exams.map((e) => e.name)
    );

    // Create questions for each exam
    const allQuestions = [];
    for (const exam of exams) {
      const examQuestions = await Question.insertMany([
        {
          examId: exam._id,
          question: "What does AI stand for?",
          options: [
            "Artificial Ice",
            "Artificial Intelligence",
            "Applied Interface",
            "Augmented Insight",
          ],
          correctAnswer: 1,
        },
        {
          examId: exam._id,
          question: "Which of the following is a type of machine learning?",
          options: [
            "Supervised Learning",
            "Unsupervised Sitting",
            "Guided Inference",
            "Labeled Memory",
          ],
          correctAnswer: 0,
        },
        {
          examId: exam._id,
          question: "What is the primary goal of machine learning?",
          options: [
            "To replace humans",
            "To make predictions from data",
            "To create robots",
            "To write code",
          ],
          correctAnswer: 1,
        },
        {
          examId: exam._id,
          question: "Which algorithm is commonly used for classification?",
          options: [
            "Linear Regression",
            "K-Means",
            "Random Forest",
            "Principal Component Analysis",
          ],
          correctAnswer: 2,
        },
        {
          examId: exam._id,
          question: "What is overfitting in machine learning?",
          options: [
            "Model performs well on training data but poorly on new data",
            "Model is too simple",
            "Model has too few parameters",
            "Model is too fast",
          ],
          correctAnswer: 0,
        },
      ]);
      allQuestions.push(...examQuestions);
    }

    console.log(`Created ${allQuestions.length} questions total`);

    // Create some submissions (random students for each exam)
    const submissions = [];
    for (const exam of exams) {
      const examStudents = exam.candidates;
      const numSubmissions =
        Math.floor(Math.random() * examStudents.length) + 1; // Random number of submissions

      for (let i = 0; i < numSubmissions; i++) {
        const studentId = examStudents[i];
        const submission = await Submission.create({
          studentId: studentId,
          examId: exam._id,
          answers: [
            "Artificial Intelligence",
            "Supervised Learning",
            "To make predictions from data",
            "Random Forest",
            "Model performs well on training data but poorly on new data",
          ],
          submittedAt: new Date(),
        });
        submissions.push(submission);
      }
    }

    console.log(`Created ${submissions.length} submissions`);

    // Create some alerts (random students)
    const alerts = [];
    for (let i = 0; i < 15; i++) {
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomExam = exams[Math.floor(Math.random() * exams.length)];

      const alert = await Alert.create({
        studentId: randomStudent._id,
        examId: randomExam._id,
        recording: `https://example.com/recordings/recording_${i + 1}.mp4`,
        alertAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        type: [
          "Face Detection",
          "Multiple Faces",
          "No Face Detected",
          "Phone Usage",
          "Tab Switching",
        ][Math.floor(Math.random() * 5)],
      });
      alerts.push(alert);
    }

    console.log(`Created ${alerts.length} alerts`);

    console.log("✅ Seed data inserted successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Questions: ${allQuestions.length}`);
    console.log(`   - Submissions: ${submissions.length}`);
    console.log(`   - Alerts: ${alerts.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
