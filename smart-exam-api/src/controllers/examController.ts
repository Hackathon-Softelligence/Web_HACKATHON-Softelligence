import { Request, Response } from "express";
import Exam from "../models/Exam";
import Question from "../models/Question";
import Alert from "../models/Alert";
import Student from "../models/Student";
import Submission from "../models/Submission";

export const getExamList = async (_req: Request, res: Response) => {
  const exams = await Exam.find();
  res.json(exams);
};

export const getExamDataWithQuestions = async (req: Request, res: Response) => {
  const examId = req.params.id;
  const exam = await Exam.findById(examId);
  const questions = await Question.find({ examId });
  res.json({ exam, questions });
};

export const getAlertsByExam = async (req: Request, res: Response) => {
  const alerts = await Alert.find({ examId: req.params.id }).populate(
    "studentId"
  );
  res.json(alerts);
};

export const getAlertById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const alert = await Alert.findById(req.params.id).populate("studentId");
  res.json(alert);
};

export const getAlertByStudentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.params.studentId;

    // Kiểm tra student có tồn tại không
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Lấy tất cả alerts của học sinh này
    const alerts = await Alert.find({ studentId })
      .populate("studentId", "name avatar")
      .populate("examId", "name startTime endTime status room")
      .sort({ alertAt: -1 }); // Sắp xếp theo thời gian alert mới nhất

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        avatar: student.avatar,
      },
      alerts: alerts,
      totalAlerts: alerts.length,
    });
  } catch (error) {
    console.error("Error getting alerts by student ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentListByExamId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const examId = req.params.id;

    // Kiểm tra exam có tồn tại không
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    // Lấy danh sách học sinh từ candidates của exam
    const candidates = await Student.find({ _id: { $in: exam.candidates } });

    // Lấy danh sách submissions của học sinh cho exam này
    const submissions = await Submission.find({ examId }).populate("studentId");

    // Tạo map để theo dõi học sinh đã submit
    const submittedStudents = new Map();
    submissions.forEach((submission) => {
      submittedStudents.set((submission.studentId as any)._id.toString(), {
        student: submission.studentId,
        hasSubmitted: true,
        submissionId: submission._id,
      });
    });

    // Kết hợp thông tin candidates và submissions
    const studentList = candidates.map((student) => {
      const studentId = (student._id as any).toString();
      const submissionInfo = submittedStudents.get(studentId);

      return {
        _id: student._id,
        name: student.name,
        avatar: student.avatar,
        hasSubmitted: submissionInfo ? true : false,
        submissionId: submissionInfo?.submissionId || null,
      };
    });

    res.json({
      exam: {
        _id: exam._id,
        name: exam.name,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        room: exam.room,
      },
      students: studentList,
      totalStudents: studentList.length,
      submittedCount: submissions.length,
    });
  } catch (error) {
    console.error("Error getting student list by exam ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New function: getStudentsByExamId - Simplified version
export const getStudentsByExamId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const examId = req.params.id;

    // Kiểm tra exam có tồn tại không
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    // Lấy danh sách học sinh từ candidates của exam
    const students = await Student.find({ _id: { $in: exam.candidates } })
      .select("_id name avatar")
      .sort({ name: 1 });

    res.json({
      examId: exam._id,
      examName: exam.name,
      students: students,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Error getting students by exam ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New function: getAllAlertsByStudentId - Enhanced version
export const getAllAlertsByStudentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.params.studentId;

    // Kiểm tra student có tồn tại không
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Lấy tất cả alerts của học sinh này với thông tin chi tiết
    const alerts = await Alert.find({ studentId })
      .populate("studentId", "name avatar")
      .populate("examId", "name startTime endTime status room")
      .sort({ alertAt: -1 }); // Sắp xếp theo thời gian alert mới nhất

    // Thống kê alerts theo loại
    const alertStats = {
      total: alerts.length,
      byType: {} as Record<string, number>,
      byExam: {} as Record<string, number>,
    };

    alerts.forEach((alert) => {
      const alertType = (alert as any).type || "Unknown";
      const examName = (alert.examId as any)?.name || "Unknown Exam";

      alertStats.byType[alertType] = (alertStats.byType[alertType] || 0) + 1;
      alertStats.byExam[examName] = (alertStats.byExam[examName] || 0) + 1;
    });

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        avatar: student.avatar,
      },
      alerts: alerts,
      statistics: alertStats,
      totalAlerts: alerts.length,
    });
  } catch (error) {
    console.error("Error getting all alerts by student ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New function: getExamStudentsWithAlerts - Returns all students in exam with their alerts
export const getExamStudentsWithAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const examId = req.params.id;

    // Kiểm tra exam có tồn tại không
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    // Lấy danh sách học sinh từ candidates của exam
    const students = await Student.find({ _id: { $in: exam.candidates } })
      .select("_id name avatar")
      .sort({ name: 1 });

    // Lấy tất cả alerts của exam này
    const allAlerts = await Alert.find({ examId })
      .populate("studentId", "name avatar")
      .populate("examId", "name startTime endTime status room")
      .sort({ alertAt: -1 });

    // Lấy danh sách submissions của học sinh cho exam này
    const submissions = await Submission.find({ examId }).populate("studentId");

    // Tạo map để theo dõi học sinh đã submit
    const submittedStudents = new Map();
    submissions.forEach((submission) => {
      submittedStudents.set((submission.studentId as any)._id.toString(), {
        hasSubmitted: true,
        submissionId: submission._id,
      });
    });

    // Nhóm alerts theo studentId
    const alertsByStudent = new Map();
    allAlerts.forEach((alert: any) => {
      const studentId = (alert.studentId as any)._id.toString();
      if (!alertsByStudent.has(studentId)) {
        alertsByStudent.set(studentId, []);
      }
      alertsByStudent.get(studentId).push(alert);
    });

    // Tạo thống kê tổng quan
    const examStats = {
      totalStudents: students.length,
      totalAlerts: allAlerts.length,
      submittedCount: submissions.length,
      alertTypes: {} as Record<string, number>,
      studentsWithAlerts: 0,
    };

    // Thống kê loại alerts
    allAlerts.forEach((alert: any) => {
      const alertType = alert.type || "Unknown";
      examStats.alertTypes[alertType] =
        (examStats.alertTypes[alertType] || 0) + 1;
    });

    // Kết hợp thông tin students với alerts và submission status
    const studentsWithData = students.map((student) => {
      const studentId = (student._id as any).toString();
      const studentAlerts = alertsByStudent.get(studentId) || [];
      const submissionInfo = submittedStudents.get(studentId);

      // Thống kê alerts của student này
      const studentAlertStats = {
        total: studentAlerts.length,
        byType: {} as Record<string, number>,
      };

      studentAlerts.forEach((alert: any) => {
        const alertType = alert.type || "Unknown";
        studentAlertStats.byType[alertType] =
          (studentAlertStats.byType[alertType] || 0) + 1;
      });

      if (studentAlerts.length > 0) {
        examStats.studentsWithAlerts++;
      }

      return {
        _id: student._id,
        name: student.name,
        avatar: student.avatar,
        hasSubmitted: submissionInfo ? true : false,
        submissionId: submissionInfo?.submissionId || null,
        alerts: studentAlerts,
        alertStatistics: studentAlertStats,
        totalAlerts: studentAlerts.length,
      };
    });

    res.json({
      exam: {
        _id: exam._id,
        name: exam.name,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        room: exam.room,
      },
      students: studentsWithData,
      examStatistics: examStats,
      totalStudents: students.length,
      totalAlerts: allAlerts.length,
    });
  } catch (error) {
    console.error("Error getting exam students with alerts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
