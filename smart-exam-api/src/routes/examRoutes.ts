import express from "express";
import {
    getExamList,
    getExamDataWithQuestions,
    getAlertsByExam,
    getAlertById,
    getStudentListByExamId,
    getAlertByStudentId,
} from "../controllers/examController";

const router = express.Router();

router.get("/exams", getExamList);
router.get("/exams/:id/students", getStudentListByExamId);
router.get("/exams/:id/alerts", getAlertsByExam);
router.get("/exams/:id", getExamDataWithQuestions);
router.get("/alerts/:id", getAlertById);
router.get("/students/:studentId/alerts", getAlertByStudentId);

export default router;
