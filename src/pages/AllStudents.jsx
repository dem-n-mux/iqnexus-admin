import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { BASE_URL } from "../Api";
import html2pdf from "html2pdf.js";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';



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

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0); // Added for total count
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
  const [selectedExamLevel, setSelectedExamLevel] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [school, setSchool] = useState({});

  const attendanceRef = useRef(null);


  const exams = [
    { name: "IENGOL1", level: "L1" },
    { name: "IENGOL1Book", level: "L1" },
    { name: "IAOL1", level: "L1" },
    { name: "IAOL1Book", level: "L1" },
    { name: "ITSTL1", level: "L1" },
    { name: "ITSTL1Book", level: "L1" },
    { name: "IMOL1", level: "L1" },
    { name: "IMOL1Book", level: "L1" },
    { name: "IGKOL1", level: "L1" },
    { name: "IGKOL1Book", level: "L1" },
    { name: "IAOL2", level: "L2" },
    { name: "ITSTL2", level: "L2" },
    { name: "IMOL2", level: "L2" },
    { name: "IENGOL2", level: "L2" },
  ];

  // Fetch the student data based on filters
  const handleFetchStudents = async () => {
    // Check if all filters are selected
    if (!selectedExamLevel || !selectedExam || !selectedSchoolCode || !selectedClass || !selectedSection) {
      alert("Please select all filters!");
      return;
    }

    // Create the request body with the selected filters
    const filters = {
      examLevel: selectedExamLevel,
      exam: selectedExam,
      schoolCode: selectedSchoolCode,
      class: selectedClass,
      section: selectedSection,
    };

    try {
      // Send the filters to the backend to fetch the student data
      const res = await axios.post(`${BASE_URL}/allStudents`, filters);
      console.log(res.data)
      if (res.data.student) {
        setStudentsData(res.data.student);
        setSchool(res.data.school)
      } else {
        alert("Error fetching student data.");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Error fetching student data.");
    }
  };


  const handleDownloadPDF = async () => {
    const element = attendanceRef.current;

    if (!element) {
      alert("Nothing to export!");
      return;
    }

    try {
      // Store original styles
      const originalStyles = new Map();
      const saveStyles = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const style = node.style;
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
            whiteSpace: style.whiteSpace,
            wordBreak: style.wordBreak,
          });
          // Set PDF-safe styles to match preview
          node.style.color = "#000000";
          node.style.backgroundColor = "#ffffff";
          node.style.borderColor = "#000000";
          node.style.fontSize = "12pt";
          node.style.lineHeight = "1.5";
          node.style.padding = node.tagName === "P" ? "4px 0" : style.padding;
          node.style.margin = node.tagName === "P" ? "4px 0" : style.margin;
          if (node.tagName === "H1") {
            node.style.fontSize = "16pt";
            node.style.fontWeight = "bold";
            node.style.textAlign = "center";
          }
          if (node.tagName === "H2") {
            node.style.fontSize = "14pt";
            node.style.fontWeight = "bold";
            node.style.textAlign = "center";
          }
          if (node.tagName === "TABLE") {
            node.style.borderCollapse = "collapse";
            node.style.width = "100%";
            node.style.boxSizing = "border-box";
          }
          if (node.tagName === "TH" || node.tagName === "TD") {
            node.style.padding = "6px";
            node.style.border = "1px solid #000000";
            node.style.textAlign = node.tagName === "TH" ? "center" : "left";
            node.style.whiteSpace = "normal";
            node.style.wordBreak = "break-word";
            // Set explicit column widths
            if (node.cellIndex === 0) node.style.width = "7%"; // S.No
            if (node.cellIndex === 1) node.style.width = "14%"; // Roll No
            if (node.cellIndex === 2) node.style.width = "19%"; // Name
            if (node.cellIndex === 3) node.style.width = "17%"; // Father
            if (node.cellIndex === 4) node.style.width = "17%"; // Mother
            if (node.cellIndex === 5) node.style.width = "9%"; // Class
            if (node.cellIndex === 6) node.style.width = "7%"; // Sec
            if (node.cellIndex === 7) node.style.width = "10%"; // Attendance
          }
          if (node.classList.contains("bg-gray-100")) {
            node.style.backgroundColor = "#e5e7eb";
          }
          node.childNodes.forEach(saveStyles);
        }
      };

      // Apply safe styles
      saveStyles(element);

      // Ensure element is fully visible for capture
      const originalPosition = element.style.position;
      const originalTop = element.style.top;
      const originalLeft = element.style.left;
      element.style.position = "static";
      element.style.top = "0";
      element.style.left = "0";

      // Capture with html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
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
        node.style.whiteSpace = styles.whiteSpace;
        node.style.wordBreak = styles.wordBreak;
      });
      element.style.position = originalPosition;
      element.style.top = originalTop;
      element.style.left = originalLeft;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate available content height per page
      const maxContentHeight = pageHeight - 2 * margin;

      if (imgHeight <= maxContentHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // Paginate content
        let currentHeight = 0;
        const pixelsPerMm = canvas.height / imgHeight; // Pixels per mm in the scaled image

        while (currentHeight < imgHeight) {
          const yOffset = currentHeight * pixelsPerMm; // Convert mm to pixels for cropping
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            margin,
            imgWidth,
            Math.min(maxContentHeight, imgHeight - currentHeight),
            undefined,
            "SLOW",
            0,
            -yOffset
          );
          currentHeight += maxContentHeight;
          if (currentHeight < imgHeight) {
            pdf.addPage();
          }
        }
      }

      // Save PDF
      pdf.save(`Attendance_${selectedClass}_${selectedSection}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
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
        // Convert to boolean: "1" -> true, "0" -> false, or use existing boolean
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

  // In handleUpdateSubmit, include _id and handle errors
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { _id: selectedStudent._id };
      Object.keys(updatedData).forEach((key) => {
        if (booleanFields.includes(key)) {
          payload[key] = updatedData[key] ? "1" : "0"; // Backend expects "1" or "0" for string fields
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
      rangeWithDots.pu
      sh("...");
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
                        className={`px-3 py-1 rounded-md ${currentPage === item
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
                              className={`px-4 py-2 text-sm font-medium ${updatedData[field]
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
                              className={`px-4 py-2 text-sm font-medium ${!updatedData[field]
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
                {/* Exam Level */}
                <div>
                  <label className="block text-sm font-medium">Exam Level</label>
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

                {/* Select Exam */}
                <div>
                  <label className="block text-sm font-medium">Select Exam</label>
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

                {/* School Code */}
                <div>
                  <label className="block text-sm font-medium">School Code</label>
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedSchoolCode}
                    onChange={(e) => setSelectedSchoolCode(e.target.value)}
                    placeholder="Enter School Code"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium">Select Class</label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((cls) => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium">Select Section</label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fetch Data Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleFetchStudents}
                >
                  Fetch Students
                </button>
              </div>

              {/* Preview Student Data */}
              <div
                id="download"
                style={{ color: "#000000", backgroundColor: "#ffffff" }}
                className="bg-white p-7 rounded-lg shadow-md border text-sm w-full"
                ref={attendanceRef}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <img src={logo} alt="IQ Nexus" className="mx-auto h-12 mb-2" />
                  <h1 className="text-lg font-semibold uppercase">
                    International Aptitude Olympiad
                  </h1>
                  <p className="font-medium uppercase">
                    {selectedExamLevel === "L1"
                      ? "Basic Exam"
                      : selectedExamLevel === "L2"
                        ? "Advanced Exam"
                        : "Exam Level Not Selected"}
                  </p>
                  <h2 className="font-bold uppercase underline mt-2">
                    Attendance List
                  </h2>
                </div>

                {/* School Info */}
                <div className="grid grid-cols-2 text-xs mb-6 gap-y-2">
                  <div>
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
                      <strong>Class:</strong> {selectedClass || "N/A"}
                    </p>
                    <p>
                      <strong>Section:</strong> {selectedSection || "N/A"}
                    </p>
                    <p>
                      <strong>Exam Incharge:</strong> {school.incharge || "N/A"}
                    </p>
                    <p>
                      <strong>Class Teacher:</strong> {school.incharge || "N/A"}
                    </p>
                    <p>
                      <strong>Print Date:</strong>{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Table */}
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
                          <td className="border px-2 py-1">{student.section}</td>
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

                {/* Footer Summary */}
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

                {/* Note */}
                <div className="text-xs border-t pt-2 mt-2">
                  <strong>IMPORTANT NOTE:</strong> Please note that we shall print
                  certificates as per the above details. So this is very important
                  to check the spelling and correct if found wrong. So ask every
                  participant to cross check their details and then sign on it. We
                  will not re-print the certificate(s) after that.
                </div>
                <div className="mt-2"></div>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Close
                </button>

                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  onClick={handleDownloadPDF} // Implement this if needed
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllStudents;
