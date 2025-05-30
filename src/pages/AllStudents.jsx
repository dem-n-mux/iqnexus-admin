import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { BASE_URL } from "../Api";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import logo from "../assets/main_logo.png";

// List of fields that should be treated as booleans ("0" or "1")
const booleanFields = [
  "IENGOL1",
  "IENGOL1Book",
  "IENGOL2",
  "IAOL1",
  "IAOL1Book",
  "ITSTL1",
  "ITSTL1Book",
  "IMOL1",
  "IMOL1Book",
  "IGKOL1",
  "IGKOL1Book",
  "IAOL2",
  "ITSTL2",
  "IMOL2",
  "Duplicates",
];

// Map exam codes to full names
const examFullNames = {
  IQEOL1: {
    fullName: "IQNEXUS ENGLISH OLYMPIAD",
    code: "IQEO",
    level: "Level 1",
  },
  IQEOL2: {
    fullName: "IQNEXUS ENGLISH OLYMPIAD",
    code: "IQEO",
    level: "Level 2",
  },
  IQROL1: {
    fullName: "IQNEXUS REASONING OLYMPIAD",
    code: "IQRO",
    level: "Level 1",
  },
  IQROL2: {
    fullName: "IQNEXUS REASONING OLYMPIAD",
    code: "IQRO",
    level: "Level 2",
  },
  IQSOL1: {
    fullName: "IQNEXUS SCIENCE OLYMPIAD",
    code: "IQSO",
    level: "Level 1",
  },
  IQSOL2: {
    fullName: "IQNEXUS SCIENCE OLYMPIAD",
    code: "IQSO",
    level: "Level 2",
  },
  IQMOL1: {
    fullName: "IQNEXUS MATHEMATICS OLYMPIAD",
    code: "IQMO",
    level: "Level 1",
  },
  IQMOL2: {
    fullName: "IQNEXUS MATHEMATICS OLYMPIAD",
    code: "IQMO",
    level: "Level 2",
  },
  IQGKOL1: {
    fullName: "IQNEXUS GENERAL KNOWLEDGE OLYMPIAD",
    code: "IQGKO",
    level: "Level 1",
  },
  IQGKOL2: {
    fullName: "IQNEXUS GENERAL KNOWLEDGE OLYMPIAD",
    code: "IQGKO",
    level: "Level 2",
  },
};

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [limit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [noStudentsFound, setNoStudentsFound] = useState(false);
  const [searchData, setSearchData] = useState({
    studentName: "",
    classes: [],
    schoolCode: null,
    rollNo: "",
    sections: [],
    subject: "",
  });

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedExamLevel, setSelectedExamLevel] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSchoolCode, setSelectedSchoolCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [school, setSchool] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const attendanceRef = useRef(null);

  const exams = [
    { name: "IQEOL1", level: "L1" },
    { name: "IQEOL2", level: "L2" },
    { name: "IQROL1", level: "L1" },
    { name: "IQROL2", level: "L2" },
    { name: "IQSOL1", level: "L1" },
    { name: "IQSOL2", level: "L2" },
    { name: "IQMOL1", level: "L1" },
    { name: "IQMOL2", level: "L2" },
    { name: "IQGKOL1", level: "L1" },
    { name: "IQGKOL2", level: "L2" },
  ];

  // Fetch the student data based on filters
  const handleFetchStudents = async () => {
    if (!selectedExamLevel || !selectedExam || !selectedSchoolCode) {
      alert("Please select exam level, exam, and school code!");
      return;
    }

    const filters = {
      examLevel: selectedExamLevel,
      exam: selectedExam || undefined,
      schoolCode: selectedSchoolCode || undefined,
      classes:
        selectedClasses.length > 0
          ? selectedClasses.map((opt) => opt.value)
          : undefined,
      sections:
        selectedSections.length > 0
          ? selectedSections.map((opt) => opt.value)
          : undefined,
    };

    try {
      setIsFetching(true);
      const res = await axios.post(`${BASE_URL}/allStudents`, filters);
      if (res.data.student) {
        setStudentsData(res.data.student);
        setSchool(res.data.school || {});
        setIsFetched(true);
      } else {
        setStudentsData([]);
        setIsFetched(true);
        alert("Error fetching student data.");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setStudentsData([]);
      setIsFetched(true);
      alert("Error fetching student data.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = attendanceRef.current;

    if (!element) {
      alert("Nothing to export!");
      return;
    }

    try {
      setIsDownloading(true);
      // Store original styles
      const originalStyles = new Map();
      const saveStyles = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const style = window.getComputedStyle(node);
          originalStyles.set(node, {
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            padding: style.padding,
            margin: style.margin,
            fontWeight: style.fontWeight,
            textAlign: style.textAlign,
            width: style.width,
          });

          // Apply PDF-safe styles
          node.style.color = "#000000";
          node.style.backgroundColor = "transparent";
          node.style.borderColor = "#000000";
          node.style.fontFamily = "Arial, sans-serif";
          node.style.fontSize = "12px";
          node.style.lineHeight = "1.5";

          // Center content
          if (node.tagName === "H1" || node.tagName === "H2") {
            node.style.textAlign = "center";
            node.style.textTransform = "uppercase";
            node.style.marginBottom = "6px";
            node.style.fontSize = "14px";
          }

          if (node.tagName === "P") {
            node.style.textAlign = "left";
            node.style.textTransform = "uppercase";
            node.style.marginBottom = "6px";
          }

          if (node.id == "exam-name") {
            node.style.textAlign = "center";
          }

          // Image (logo)
          if (node.tagName === "IMG") {
            node.style.display = "block";
            node.style.marginLeft = "auto";
            node.style.marginRight = "auto";
            node.style.height = "45px";
            node.style.marginBottom = "10px";
          }

          // Center grids and tables
          if (node.classList.contains("grid") || node.tagName === "TABLE") {
            node.style.width = "85%";
            node.style.marginLeft = "auto";
            node.style.marginRight = "auto";
            node.style.fontSize = "10px";
          }

          if (node.tagName === "TABLE") {
            node.style.borderCollapse = "collapse";
          }

          if (node.tagName === "TH") {
            node.style.border = "0.5px solid rgb(184, 178, 178)";
            node.style.textAlign = "center";
            node.style.padding = "3px 5px";
          }

          if (node.tagName === "TD") {
            node.style.textAlign = "center";
            node.style.padding = "3px 5px";
            node.style.boxSizing = "border-box";
          }

          if (node.tagName === "TH") {
            node.style.backgroundColor = "#e5e7eb";
            node.style.fontWeight = "600";
          }

          // Note section
          if (node.classList.contains("border-t")) {
            node.style.borderTop = "1px solid #000000";
            node.style.paddingTop = "10px";
            node.style.marginTop = "10px";
            node.style.width = "85%";
            node.style.marginLeft = "auto";
            node.style.marginRight = "auto";
            node.style.fontSize = "9px";
          }

          // Root div
          if (node.id === "download") {
            node.style.padding = "20px";
            node.style.border = "1px solid #000000";
            node.style.backgroundColor = "#ffffff";
            node.style.width = "100%";
          }

          node.childNodes.forEach(saveStyles);
        }
      };

      // Apply styles
      saveStyles(element);

      // Ensure element is fully visible for capture
      const originalPosition = element.style.position;
      const originalTop = element.style.top;
      const originalLeft = element.style.left;
      const originalWidth = element.style.width;
      element.style.position = "static";
      element.style.top = "0";
      element.style.left = "0";
      element.style.width = "100%";

      // Capture with html2canvas
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: true,
        windowWidth: element.scrollWidth + 50,
        windowHeight: element.scrollHeight + 50,
      });

      // Restore original styles and positioning
      originalStyles.forEach((styles, node) => {
        node.style.color = styles.color;
        node.style.backgroundColor = styles.backgroundColor;
        node.style.borderColor = styles.borderColor;
        node.style.fontSize = styles.fontSize;
        node.style.lineHeight = styles.lineHeight;
        node.style.padding = styles.padding;
        node.style.margin = styles.margin;
        node.style.fontWeight = styles.fontWeight;
        node.style.textAlign = styles.textAlign;
        node.style.width = styles.width;
      });
      element.style.position = originalPosition;
      element.style.top = originalTop;
      element.style.left = originalLeft;
      element.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate available content height per page
      const maxContentHeight = pageHeight - 2 * margin;

      // Simplified pagination logic
      if (imgHeight <= maxContentHeight) {
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          imgWidth,
          imgHeight,
          undefined,
          "SLOW"
        );
      } else {
        let position = 0;
        while (position < imgHeight) {
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = canvas.width;
          tempCanvas.height = Math.min(
            canvas.height - (position * canvas.width) / imgWidth,
            (maxContentHeight * canvas.width) / imgWidth
          );

          tempCtx.drawImage(
            canvas,
            0,
            (position * canvas.width) / imgWidth,
            canvas.width,
            tempCanvas.height,
            0,
            0,
            canvas.width,
            tempCanvas.height
          );

          pdf.addImage(
            tempCanvas.toDataURL("image/png"),
            "PNG",
            margin,
            margin,
            imgWidth,
            Math.min(maxContentHeight, imgHeight - position),
            undefined,
            "SLOW"
          );

          position += maxContentHeight;
          if (position < imgHeight) {
            pdf.addPage();
          }
        }
      }

      // Generate filename with multiple classes and sections
      const classString = selectedClasses.map((opt) => opt.value).join("-");
      const sectionString = selectedSections.map((opt) => opt.value).join("-");
      const filename = `Attendance_${classString}_${sectionString}${
        selectedExam ? `_${selectedExam}` : ""
      }${selectedSchoolCode ? `_${selectedSchoolCode}` : ""}.pdf`;

      // Save PDF
      pdf.save(filename);
      alert("Attendance downloaded successfully!!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch all students for Excel download without pagination
  const fetchAllStudentsForExcel = async (filters) => {
    try {
      const hasFilters = Object.values(filters).some(
        (val) =>
          (Array.isArray(val) ? val.length > 0 : val !== "" && val !== null) &&
          val !== undefined
      );

      let res;
      if (hasFilters) {
        res = await axios.post(`${BASE_URL}/all-students-no-pagination`, {
          schoolCode: filters.schoolCode
            ? Number(filters.schoolCode)
            : undefined,
          className: filters.classes.length > 0 ? filters.classes : undefined,
          rollNo: filters.rollNo || undefined,
          section: filters.sections.length > 0 ? filters.sections : undefined,
          studentName: filters.studentName || undefined,
          subject: filters.subject || undefined,
        });
      } else {
        res = await axios.post(`${BASE_URL}/all-students-no-pagination`, {});
      }

      if (res.data.success) {
        return res.data.data || [];
      } else {
        alert("No students found for the selected filters.");
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch all students for Excel:", err);
      alert("Failed to fetch students for Excel download.");
      return [];
    }
  };


  // Handle Excel download
  const handleDownloadExcel = async () => {
    const allStudents = await fetchAllStudentsForExcel(searchData);
    if (allStudents.length === 0) {
      alert("No student data to export!");
      return;
    }

    try {
      // Prepare data for Excel
      // const excelData = allStudents.map((student, index) => ({
      //   "S.No": index + 1,
      //   "Student Name": student.studentName || "N/A",
      //   "DOB": student.dob || "N/A",
      //   "Roll No": student.rollNo || "N/A",
      //   "Mobile": student.mobNo || "N/A",
      //   "School Code": student.schoolCode || "N/A",
      //   "Class": student.class || "N/A",
      //   "Section": student.section || "N/A",
      //   "Father Name": student.fatherName || "N/A",
      //   "Mother Name": student.motherName || "N/A",
      //   ...booleanFields.reduce((acc, field) => ({
      //     ...acc,
      //     [field]: student[field] === "1" || student[field] === true ? "Yes" : "No",
      //   }), {}),
      //     "Total Basic Level Participated Exams": student.totalBasicLevelParticipatedExams,
      //           "Basic Level Full Amount": student.basicLevelFullAmount,
      //           "Basic Level Paid Amount": student.basicLevelAmountPaid,
      //           "Basic Level Amount Paid Online": student.basicLevelAmountPaidOnline,
      //           "Is Basic Level Concession Given": student.isBasicLevelConcessionGiven,
      //           "Concession Reason": student.concessionReason,
      //           "Parents Working School": student.ParentsWorkingschool,
      //           "Designation": student.designation,
      //           "City": student.city || "N/A",
      //           "Advance Level Paid Amount": student.advanceLevelAmountPaid,
      //           "Advance Level Amount Paid Online": student.advanceLevelAmountPaidOnline,
      //           "Total Amount Paid": student.totalAmountPaid,
      //           "Total Amount Paid Online": student.totalAmountPaidOnline
      // }));

       const subjectNameMap = {
    IMOL: "IQMO",
    ITSTL: "IQSO",
    IENGOL: "IQEO",
    IAOL: "IQRO",
    IGKOL: "IQGKO",
  };

  // Prepare data for Excel
  const excelData = allStudents.map((student, index) => {
    const booleanMappedFields = booleanFields.reduce((acc, field) => {
      // Replace subject codes with mapped labels in the Excel column name
      let replacedField = field;
      Object.entries(subjectNameMap).forEach(([code, label]) => {
        if (field.includes(code)) {
          replacedField = field.replace(code, label);
        }
      });

      acc[replacedField] = student[field] === "1" || student[field] === true ? "Yes" : "No";
      return acc;
    }, {});

    return {
      "S.No": index + 1,
      "Student Name": student.studentName || "N/A",
      "DOB": student.dob || "N/A",
      "Roll No": student.rollNo || "N/A",
      "Mobile": student.mobNo || "N/A",
      "School Code": student.schoolCode || "N/A",
      "Class": student.class || "N/A",
      "Section": student.section || "N/A",
      "Father Name": student.fatherName || "N/A",
      "Mother Name": student.motherName || "N/A",
      ...booleanMappedFields,
      "Total Basic Level Participated Exams": student.totalBasicLevelParticipatedExams,
      "Basic Level Full Amount": student.basicLevelFullAmount,
      "Basic Level Paid Amount": student.basicLevelAmountPaid,
      "Basic Level Amount Paid Online": student.basicLevelAmountPaidOnline,
      "Is Basic Level Concession Given": student.isBasicLevelConcessionGiven,
      "Concession Reason": student.concessionReason,
      "Parents Working School": student.ParentsWorkingschool,
      "Designation": student.designation,
      "City": student.city || "N/A",
      "Advance Level Paid Amount": student.advanceLevelAmountPaid,
      "Advance Level Amount Paid Online": student.advanceLevelAmountPaidOnline,
      "Total Amount Paid": student.totalAmountPaid,
      "Total Amount Paid Online": student.totalAmountPaidOnline
    };
  });


      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");

      // Generate filename based on filters
      const classString =
        searchData.classes.length > 0 ? searchData.classes.join("-") : "All";
      const sectionString =
        searchData.sections.length > 0 ? searchData.sections.join("-") : "All";
      const filename = `Students_${classString}_${sectionString}${
        searchData.schoolCode ? `_${searchData.schoolCode}` : ""
      }${searchData.subject ? `_${searchData.subject}` : ""}.xlsx`;

      // Download Excel file
      XLSX.writeFile(wb, filename);
      alert("Student data downloaded successfully as Excel!");
    } catch (err) {
      console.error("Excel generation failed:", err);
      alert("Failed to generate Excel file. Check console for details.");
    }
  };

  // Predefined class options
  const classOptions = [
    { value: "1", label: "Class 1" },
    { value: "2", label: "Class 2" },
    { value: "3", label: "Class 3" },
    { value: "4", label: "Class 4" },
    { value: "5", label: "Class 5" },
    { value: "6", label: "Class 6" },
    { value: "7", label: "Class 7" },
    { value: "8", label: "Class 8" },
    { value: "9", label: "Class 9" },
    { value: "10", label: "Class 10" },
    { value: "11", label: "Class 11" },
    { value: "12", label: "Class 12" },
  ];

  // Predefined section options
  const sectionOptions = [
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" },
    { value: "E", label: "Section E" },
  ];

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);

  const fetchStudents = async (page, filters = {}) => {
    try {
      let res;
      const hasFilters = Object.values(filters).some(
        (val) =>
          (Array.isArray(val) ? val.length > 0 : val !== "" && val !== null) &&
          val !== undefined
      );

      if (hasFilters) {
        res = await axios.post(
          `${BASE_URL}/students?page=${page}&limit=${limit}`,
          {
            schoolCode: filters.schoolCode
              ? Number(filters.schoolCode)
              : undefined,
            className: filters.classes.length > 0 ? filters.classes : undefined,
            rollNo: filters.rollNo,
            section: filters.sections.length > 0 ? filters.sections : undefined,
            studentName: filters.studentName,
            subject: filters.subject,
          }
        );
      } else {
        res = await axios.get(
          `${BASE_URL}/all-students?page=${page}&limit=${limit}`
        );
      }

      if (res.data.success) {
        setStudents(hasFilters ? res.data.data : res.data.allStudents);
        setTotalPages(res.data.totalPages || 1);
        setTotalStudents(res.data.totalStudents);
      } else {
        setStudents([]);
        setTotalPages(1);
        setTotalStudents(0);
        setNoStudentsFound(true);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setStudents([]);
      setTotalPages(1);
      setTotalStudents(0);
      alert("Failed to fetch students.");
    } finally {
      setSearched(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (selectedOptions) => {
    setSearchData({
      ...searchData,
      classes: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleSectionChange = (selectedOptions) => {
    setSearchData({
      ...searchData,
      sections: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchStudents(1, searchData);
  };

  const handleClearFilters = () => {
    setSearchData({
      studentName: "",
      classes: [],
      schoolCode: null,
      rollNo: "",
      sections: [],
      subject: "",
    });
    setSearched(false);
    setCurrentPage(1);
    fetchStudents(1);
  };

  const handleDelete = async (rollNo, studentClass) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const res = await axios.delete(`${BASE_URL}/student`, {
          data: { rollNo, class: studentClass },
        });
        alert(res.data.message);
        fetchStudents(currentPage, searchData);
      } catch (err) {
        alert("Failed to delete student");
      }
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openUpdateModal = (student) => {
    setSelectedStudent(student);
    const formattedData = {};
    Object.keys(student).forEach((key) => {
      if (booleanFields.includes(key)) {
        formattedData[key] = student[key] === "1" || student[key] === true;
      } else if (key === "schoolCode") {
        formattedData[key] = student[key] ? Number(student[key]) : "";
      } else {
        formattedData[key] = student[key] || "";
      }
    });
    setUpdatedData(formattedData);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { _id: selectedStudent._id };
      Object.keys(updatedData).forEach((key) => {
        if (booleanFields.includes(key)) {
          payload[key] = updatedData[key] ? "1" : "0";
        } else {
          payload[key] = updatedData[key];
        }
      });
      const res = await axios.put(`${BASE_URL}/student`, payload);
      alert(res.data.message);
      setIsModalOpen(false);
      fetchStudents(currentPage, searchData);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update student";
      alert(errorMessage);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (currentPage <= delta + 1) {
      end = Math.min(totalPages, delta * 2 + 1);
    }
    if (currentPage >= totalPages - delta) {
      start = Math.max(1, totalPages - delta * 2);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (start > 2) {
      rangeWithDots.push(1);
      rangeWithDots.push("...");
    }

    rangeWithDots.push(...range);

    if (end < totalPages - 1) {
      rangeWithDots.push("...");
      rangeWithDots.push(totalPages);
    } else if (end === totalPages - 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Students</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14"
                />
              </svg>
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Get Attendance
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download Excel
            </button>
          </div>
        </div>

        {/* Search Filters */}
        {isFilterOpen && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-wrap items-end gap-4"
            >
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={searchData.studentName}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={searchData.rollNo}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                  placeholder="14100101"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Classes
                </label>
                <Select
                  isMulti
                  name="classes"
                  options={classOptions}
                  value={classOptions.filter((opt) =>
                    searchData.classes.includes(opt.value)
                  )}
                  onChange={handleClassChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select classes..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "0.1rem",
                      borderRadius: "0.375rem",
                      borderColor: "#d1d5db",
                      fontSize: "0.875rem",
                      "&:hover": { borderColor: "#6366f1" },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                  }}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sections
                </label>
                <Select
                  isMulti
                  name="sections"
                  options={sectionOptions}
                  value={sectionOptions.filter((opt) =>
                    searchData.sections.includes(opt.value)
                  )}
                  onChange={handleSectionChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select sections..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "0.1rem",
                      borderRadius: "0.375rem",
                      borderColor: "#d1d5db",
                      fontSize: "0.875rem",
                      "&:hover": { borderColor: "#6366f1" },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                  }}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  School Code
                </label>
                <input
                  type="number"
                  name="schoolCode"
                  value={searchData.schoolCode || ""}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                  placeholder="141"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={searchData.subject}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                >
                  <option value="">Select Subject</option>
                  <option value="IAO">IAO</option>
                  <option value="ITST">ITST</option>
                  <option value="IMO">IMO</option>
                  <option value="IGKO">IGKO</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 text-sm hover:bg-gray-100 transition duration-150"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition duration-150"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Student Name</th>
                <th className="px-6 py-3 text-left">DOB</th>
                <th className="px-6 py-3 text-left">Roll No</th>
                <th className="px-6 py-3 text-left">Mobile</th>
                <th className="px-6 py-3 text-left">School Code</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((stu, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {stu.studentName.charAt(0)}
                        </div>
                        <span className="ml-3 font-medium">
                          {stu.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{stu.dob || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {stu.rollNo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {stu.mobNo || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{stu.schoolCode}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openUpdateModal(stu)}
                        className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition duration-150"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(stu.rollNo, stu.class)}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition duration-150"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searched ? "No students found" : "Loading students..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} | Showing{" "}
                {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalStudents)} of{" "}
                {totalStudents} students
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {getPaginationRange().map((item, idx) =>
                    item === "..." ? (
                      <span key={idx} className="px-3 py-1 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(item)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === item
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
            <div
              className="absolute inset-0 bg-gray-700 bg-opacity-50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Update Student Details
              </h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(updatedData)
                    .filter(
                      (key) =>
                        key !== "_id" &&
                        key !== "__v" &&
                        key !== "createdAt" &&
                        key !== "updatedAt"
                    )
                    .map((field, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field}
                        </label>
                        {booleanFields.includes(field) ? (
                          <div className="inline-flex border rounded-md">
                            <button
                              type="button"
                              onClick={() =>
                                setUpdatedData((prev) => ({
                                  ...prev,
                                  [field]: true,
                                }))
                              }
                              className={`px-4 py-2 text-sm font-medium ${
                                updatedData[field]
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-100 text-gray-700"
                              } rounded-l-md hover:bg-green-500 hover:text-white transition`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setUpdatedData((prev) => ({
                                  ...prev,
                                  [field]: false,
                                }))
                              }
                              className={`px-4 py-2 text-sm font-medium ${
                                !updatedData[field]
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-100 text-gray-700"
                              } rounded-r-md hover:bg-red-500 hover:text-white transition`}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <input
                            type={
                              field === "dob"
                                ? "date"
                                : field === "schoolCode"
                                ? "number"
                                : "text"
                            }
                            name={field}
                            value={updatedData[field]}
                            onChange={handleUpdateChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                            placeholder={`Enter ${field}`}
                          />
                        )}
                      </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setIsAttendanceModalOpen(false)}
            />
            <div className="relative z-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Get Attendance</h2>

              {/* Filters Form */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">
                    Exam Level
                  </label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedExamLevel}
                    onChange={(e) => setSelectedExamLevel(e.target.value)}
                  >
                    <option value="">Select Level</option>
                    <option value="L1">Basic</option>
                    <option value="L2">Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Select Exam
                  </label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                  >
                    <option value="">Select Exam</option>
                    {exams
                      .filter((exam) => exam.level === selectedExamLevel)
                      .map((exam) => (
                        <option key={exam.name} value={exam.name}>
                          {exam.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    School Code
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedSchoolCode}
                    onChange={(e) => setSelectedSchoolCode(e.target.value)}
                    placeholder="Enter School Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Select Classes
                  </label>
                  <Select
                    isMulti
                    options={classOptions}
                    value={selectedClasses}
                    onChange={setSelectedClasses}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select classes..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: "0.1rem",
                        fontSize: "0.875rem",
                        borderColor: "black",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 50,
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Select Sections
                  </label>
                  <Select
                    isMulti
                    options={sectionOptions}
                    value={selectedSections}
                    onChange={setSelectedSections}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select sections..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: "0.1rem",
                        fontSize: "0.875rem",
                        borderColor: "black",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 50,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Fetch Data Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleFetchStudents}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <span className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Fetching...
                    </>
                  ) : (
                    "Fetch Students"
                  )}
                </button>
              </div>

              {/* Preview Student Data */}
              <div
                id="download"
                style={{ color: "#000000", backgroundColor: "#ffffff" }}
                className="bg-white p-7 rounded-lg shadow-md border text-sm w-full"
                ref={attendanceRef}
              >
                <div className="text-center mb-6">
                  <img
                    src={logo}
                    alt="IQ Nexus"
                    className="mx-auto h-12 mb-2"
                  />
                  <h1 className="text-lg font-semibold uppercase">
                    {selectedExam
                      ? `${examFullNames[selectedExam].fullName} ${examFullNames[selectedExam].level}`
                      : "Exam Not Selected"}
                  </h1>
                  <h2 className="font-bold uppercase underline mt-2">
                    Attendance List
                  </h2>
                </div>
                <div className="grid grid-cols-2 text-xs mb-6 gap-y-2">
                  <div id="top-left">
                    <p>
                      <strong>School Name:</strong> {school.schoolName || "N/A"}
                    </p>
                    <p>
                      <strong>School Code:</strong> {school.schoolCode || "N/A"}
                    </p>
                    <p>
                      <strong>City:</strong> {school.city || "N/A"}
                    </p>
                    <p>
                      <strong>Area:</strong> {school.area || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Exam Incharge:</strong> {school.incharge || "N/A"}
                    </p>
                    <p>
                      <strong>Print Date:</strong>{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <table className="table-auto w-full border text-center text-xs mb-4">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">S.No</th>
                      <th className="border px-2 py-1">Roll No</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Father</th>
                      <th className="border px-2 py-1">Mother</th>
                      <th className="border px-2 py-1">Class</th>
                      <th className="border px-2 py-1">Sec</th>
                      <th className="border px-2 py-1">Attendance (P/A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData.length > 0 ? (
                      studentsData.map((student, index) => (
                        <tr key={student._id || index}>
                          <td className="border px-2 py-1">{index + 1}</td>
                          <td className="border px-2 py-1">{student.rollNo}</td>
                          <td className="border px-2 py-1">
                            {student.studentName}
                          </td>
                          <td className="border px-2 py-1">
                            {student.fatherName || ""}
                          </td>
                          <td className="border px-2 py-1">
                            {student.motherName || ""}
                          </td>
                          <td className="border px-2 py-1">{student.class}</td>
                          <td className="border px-2 py-1">
                            {student.section}
                          </td>
                          <td className="border px-2 py-1">
                            {/* {student[selectedExam] === "1" ? "P" : "A"} */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center border py-3">
                          No student data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="grid grid-cols-2 text-xs mb-2">
                  <div>
                    <p>
                      <strong>Present Student:</strong>{" "}
                      {/* {studentsData.filter((s) => s[selectedExam] === "1").length} */}
                    </p>
                    <p>
                      <strong>Absent Student:</strong>{" "}
                      {/* {studentsData.filter((s) => s[selectedExam] !== "1").length} */}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Information Filled By:</strong>{" "}
                      ______________________
                    </p>
                    <p>
                      <strong>Mobile No:</strong> ____________________
                    </p>
                    <p>
                      <strong>Sign:</strong> ____________________
                    </p>
                  </div>
                </div>
                <div className="text-xs border-t pt-2 mt-2">
                  <strong>IMPORTANT NOTE:</strong> Please note that we shall
                  print certificates as per the above details. So this is very
                  important to check the spelling and correct if found wrong. So
                  ask every participant to cross check their details and then
                  sign on it. We will not re-print the certificate(s) after
                  that.
                </div>
                <div className="mt-2"></div>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDownloading || isFetching}
                >
                  Close
                </button>

                {isFetched && (
                  <button
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Downloading...
                      </>
                    ) : (
                      "Download PDF"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStudents;
