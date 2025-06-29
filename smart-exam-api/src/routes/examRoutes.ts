import express from "express";
import {
  getExamList,
  getExamDataWithQuestions,
  getAlertsByExam,
  getAlertById,
  getStudentListByExamId,
  getAlertByStudentId,
  getStudentsByExamId,
  getAllAlertsByStudentId,
  getExamStudentsWithAlerts,
} from "../controllers/examController";

const router = express.Router();

router.get("/exams", getExamList);
router.get("/exams/:id/students", getStudentListByExamId);
router.get("/exams/:id/students-simple", getStudentsByExamId);
router.get("/exams/:id/students-with-alerts", getExamStudentsWithAlerts);
router.get("/exams/:id/alerts", getAlertsByExam);
router.get("/exams/:id", getExamDataWithQuestions);
router.get("/alerts/:id", getAlertById);
router.get("/students/:studentId/alerts", getAlertByStudentId);
router.get("/students/:studentId/all-alerts", getAllAlertsByStudentId);

export default router;
