import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Home from "./pages/Home";
import UploadBulkSchoolData from "./pages/UploadBulkSchoolData";
import UploadBulkStudentData from "./pages/UploadBulkStudentData";
import SingleStudentForm from "./pages/SingleStudentForm";
import SingleSchoolForm from "./pages/SingleSchoolForm";
import UpdateStudent from "./pages/UpdateStudent";
import AllSchools from "./pages/AllSchools";
import AllStudents from "./pages/AllStudents";
import LoginPage from "./pages/LoginPage";
import SchoolPartList from "./pages/SchoolPartList";
import AdmitCard from "./pages/AdmitCard"
import KinderGartenStudentForm from "./pages/kindergarten-student-form"
import AllKindergartenStudents from "./pages/AllKindergartenStudent"
import UploadBulkKindergartenStudentData from "./pages/UploadBulkKindergartenStudent"
import StudyMaterial from "./pages/StudyMaterial";
import Amountwiselist from "./pages/Amountwiselist";
import SectionPartList from "./pages/SectionPartList";
import Classwiselist from "./pages/Classwiselist";
import Studymatview from "./pages/Studymatview";
import FeedbackView from "./pages/Feedbackview";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Sidebar />}>
            <Route path="/" element={<Home />} />
            <Route path="/uploadStudentData" element={<UploadBulkStudentData />} />
            <Route path="/uploadSchoolData" element={<UploadBulkSchoolData />} />
            <Route path="/singleStudent" element={<SingleStudentForm />} />
            <Route path="/singleSchool" element={<SingleSchoolForm />} />
            {/* <Route path="/updateStudent" element={< UpdateStudent />} /> */}
            <Route path="/School-wise" element={<SchoolPartList />} />
            <Route path="/Cost-wise" element={<Amountwiselist />} />
            <Route path="/Section-wise" element={<SectionPartList />} />
            <Route path="/Class-wise" element={<Classwiselist />} />
            <Route path="/Feedbackview" element={<FeedbackView />} />
            <Route path="/StudyMaterial" element={<StudyMaterial />} />
            <Route path="/studymatview" element={ <Studymatview />} />
            <Route path="/allSchools" element={< AllSchools />} />
            <Route path="/allStudents" element={< AllStudents />} />
            <Route path="/genrate-admit-card" element={< AdmitCard />} />
            <Route path="/allkindargartenStudents" element={< AllKindergartenStudents />} />
            <Route path="/kindargartenStudent" element={< KinderGartenStudentForm />} />
            <Route path="/uploadKindergartenStudentData" element={< UploadBulkKindergartenStudentData />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
