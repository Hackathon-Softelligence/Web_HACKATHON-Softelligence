import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PreExamSetup from "./screens/PreExamSetup"
import EnvironmentCheckResult from "./screens/EnvironmentCheckResult"
import InstructionsScreen from "./screens/InstructionsScreen"
import ExamScreen from "./screens/ExamScreen"
import SubmitScreen from "./screens/SubmitScreen"
import PostExamFeedback from "./screens/PostExamFeedback"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PreExamSetup />} />
          <Route path="/environment-check" element={<EnvironmentCheckResult />} />
          <Route path="/instructions" element={<InstructionsScreen />} />
          <Route path="/exam" element={<ExamScreen />} />
          <Route path="/submit" element={<SubmitScreen />} />
          <Route path="/feedback" element={<PostExamFeedback />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
