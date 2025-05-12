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
import AdmitCard from "./pages/AdmitCard"

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
            <Route path="/allSchools" element={< AllSchools />} />
            <Route path="/allStudents" element={< AllStudents />} />
            <Route path="/genrate-admit-card" element={< AdmitCard />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
