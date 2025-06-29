import mongoose from "mongoose";
import dotenv from 'dotenv';
import Student from "../models/Student";
import Alert from "../models/Alert";
import Exam from "../models/Exam";
import Question from "../models/Question";
import Submission from "../models/Submission";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI, { dbName: 'smartexamdb' });

        // Create student
        const student = await Student.create({
            name: 'Lan Phuong',
            avatar: 'https://example.com'
        });

        // Create exam
        const exam = await Exam.create({
            name: 'AI Midterm',
            startTime: new Date(Date.now() + 3600_000),
            endTime: new Date(Date.now() + 7200_000),
            candidates: [student._id],
            status: 'Scheduled',
            room: 'Online'
        });

        // Create questions
        const questions = await Question.insertMany([
            {
                examId: exam._id,
                question: 'What does AI stand for?',
                options: ['Artificial Ice', 'Artificial Intelligence', 'Applied Interface', 'Augmented Insight']
            },
            {
                examId: exam._id,
                question: 'Which of the following is a type of machine learning?',
                options: ['Supervised Learning', 'Unsupervised Sitting', 'Guided Inference', 'Labeled Memory']
            }
        ]);

        // Create submission
        const submission = await Submission.create({
            studentId: student._id,
            examId: exam._id,
            answers: ['Artificial Intelligence', 'Supervised Learning']
        });

        // Create alerts
        const alert = await Alert.create({
            studentId: student._id,
            examId: exam._id,
            recording: 'https://example.com/recording.mp4'
        });

        console.log('Seed data inserted');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
