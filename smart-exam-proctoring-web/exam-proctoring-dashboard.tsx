"use client";

import { useState } from "react";
import { DashboardLayout } from "./components/dashboard-layout";
import { ExamDashboard } from "./components/exam-dashboard";
import { LiveMonitoring } from "./components/live-monitoring";
import { StudentDetailModal } from "./components/student-detail-modal";
import { AlertsPanel } from "./components/alerts-panel";
import { ReportsEvidence } from "./components/reports-evidence";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { DialogflowWidget } from "./components/dialogflow-widget";
=======
import { FirebaseConnectionTest } from "./components/firebase-connection-test";
>>>>>>> Stashed changes
=======
import { FirebaseConnectionTest } from "./components/firebase-connection-test";
>>>>>>> Stashed changes
=======
import { FirebaseConnectionTest } from "./components/firebase-connection-test";
>>>>>>> Stashed changes

export default function ExamProctoringDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const handleViewMonitoring = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentView("monitoring");
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setSelectedStudentId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <ExamDashboard onViewMonitoring={handleViewMonitoring} />;
      case "monitoring":
        return (
          <div className="flex h-full">
            <div className="flex-1">
              {selectedExamId ? (
                <LiveMonitoring
                  examId={selectedExamId}
                  onStudentSelect={handleStudentSelect}
                />
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">
                    No exam selected for monitoring
                  </p>
                </div>
              )}
            </div>
            <div className="w-80 border-l border-gray-200">
              <AlertsPanel />
            </div>
          </div>
        );
      case "reports":
        return <ReportsEvidence examId={selectedExamId || undefined} />;
      case "firebase-test":
        return <FirebaseConnectionTest />;
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-exam-primary mb-4">
              Settings
            </h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <ExamDashboard onViewMonitoring={handleViewMonitoring} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </DashboardLayout>

      <StudentDetailModal
        studentId={selectedStudentId}
        examId={selectedExamId || undefined}
        isOpen={isStudentModalOpen}
        onClose={handleCloseStudentModal}
      />

      {/* <ChatbotAssistant /> */}
      <DialogflowWidget />
    </div>
  );
}
