import React, { useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { BASE_URL } from "../Api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/main_logo.png";

const AdmitCard = () => {
    const [students, setStudents] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [limit] = useState(10);
    const [noStudentsFound, setNoStudentsFound] = useState(false);
    const [searchData, setSearchData] = useState({
        // classes: [],
        schoolCode: null,
        // sections: [],
        examLevel: "",
        // exam: "",
        session: "",
    });
    const [school, setSchool] = useState({});
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const sessionOptions = [
        { value: "2024-25", label: "2024-25" },
        { value: "2025-26", label: "2025-26" },
        { value: "2026-27", label: "2026-27" },
    ];

    const admitCardRef = useRef(null);

    const fetchStudents = async (page, filters = {}) => {
        try {
            let res;
            const hasFilters = Object.values(filters).some(
                (val) =>
                    (Array.isArray(val) ? val.length > 0 : val !== "" && val !== null) &&
                    val !== undefined
            );

            if (!hasFilters) {
                setStudents([]);
                setTotalPages(1);
                setTotalStudents(0);
                setNoStudentsFound(false);
                return;
            }

            res = await axios.post(
                `${BASE_URL}/students?page=${page}&limit=${limit}`,
                {
                    schoolCode: filters.schoolCode
                        ? Number(filters.schoolCode)
                        : undefined,
                    // className: filters.classes.length > 0 ? filters.classes : undefined,
                    // section: filters.sections.length > 0 ? filters.sections : undefined,
                    examLevel: filters.examLevel || undefined,
                    // exam: filters.exam || undefined,
                    session: filters.session || undefined,
                }
            );

            if (res.data.success) {
                setStudents(res.data.data);
                setTotalPages(res.data.totalPages || 1);
                setTotalStudents(res.data.totalStudents);
                setNoStudentsFound(false);
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

    // const handleClassChange = (selectedOptions) => {
    //   setSearchData({
    //     ...searchData,
    //     classes: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    //   });
    // };

    // const handleSectionChange = (selectedOptions) => {
    //   setSearchData({
    //     ...searchData,
    //     sections: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    //   });
    // };

    const handleExamLevelChange = (e) => {
        setSearchData({ ...searchData, examLevel: e.target.value });
    };

    // const handleExamChange = (e) => {
    //   setSearchData({ ...searchData, exam: e.target.value });
    // };

    const handleSessionChange = (selectedOption) => {
        setSearchData({
            ...searchData,
            session: selectedOption ? selectedOption.value : "",
        });
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setCurrentPage(1);
        await fetchStudents(1, searchData);
    };

    const handleClearFilters = () => {
        setSearchData({
            // classes: [],
            schoolCode: null,
            // sections: [],
            examLevel: "",
            // exam: "",
            session: "",
        });
        setSearched(false);
        setStudents([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalStudents(0);
        setNoStudentsFound(false);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchStudents(page, searchData);
        }
    };

    const openAdmitCardModal = async (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
        try {
            const res = await axios.get(`${BASE_URL}/get-school/${student.schoolCode}`);
            setSchool(res.data.school);
        } catch (err) {
            console.error("Failed to fetch school:", err);
            alert("Failed to fetch school details.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    const downloadAdmitCard = async () => {
        const element = admitCardRef.current;

        if (!element) {
            alert("Admit card element not found.");
            return;
        }

        try {
            setIsDownloading(true);

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
                    });
                    node.style.color = '#000000';
                    node.style.backgroundColor = '#ffffff';
                    node.style.borderColor = '#000000';
                    node.style.fontSize = '13px';
                    node.style.lineHeight = '1.6';
                    node.style.padding = node.tagName === 'P' ? '3px 0' : style.padding;
                    node.childNodes.forEach(saveStyles);
                }
            };

            saveStyles(element);

            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                logging: true,
                windowWidth: element.scrollWidth + 40,
                windowHeight: element.scrollHeight + 40,
            });

            originalStyles.forEach((styles, node) => {
                node.style.color = styles.color;
                node.style.backgroundColor = styles.backgroundColor;
                node.style.borderColor = styles.borderColor;
                node.style.fontSize = styles.fontSize;
                node.style.lineHeight = styles.lineHeight;
                node.style.padding = styles.padding;
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

            pdf.save(`${selectedStudent.studentName}-AdmitCard.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            alert("Failed to download admit card. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const storeAdmitCard = async () => {
        if (!selectedStudent || !selectedStudent.mobNo) {
            alert("No student or mobile number selected for admit card storage.");
            return;
        }

        try {
            setIsGenerating(true);

            const level = searchData.examLevel === "L1" ? "Basic" : searchData.examLevel === "L2" ? "Advance" : "";
            const session = searchData.session || "";

            const response = await axios.post(`${BASE_URL}/admit-card`, {
                mobNo: selectedStudent.mobNo,
                level,
                session,
            });

            console.log(response.data);
            alert(response.data.message);
        } catch (error) {
            console.error("Failed to store admit card:", error);
            const errorMessage =
                error.response?.data?.error || "Failed to store admit card.";
            alert(errorMessage);
        } finally {
            setIsGenerating(false);
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

    // Check if all three filters are selected to enable the Search button
    const isSearchDisabled = !(
        searchData.examLevel !== "" &&
        searchData.session !== "" &&
        (searchData.schoolCode !== null && searchData.schoolCode !== "")
    );

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Generate Admit Card</h1>
                </div>

                <div className="bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex flex-wrap items-end gap-4"
                    >
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Exam Level
                            </label>
                            <select
                                name="examLevel"
                                value={searchData.examLevel}
                                onChange={handleExamLevelChange}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                            >
                                <option value="">Select Level</option>
                                <option value="L1">Basic</option>
                                <option value="L2">Advance</option>
                            </select>
                        </div>
                        {/* <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Exam Name
              </label>
              <select
                name="exam"
                value={searchData.exam}
                onChange={handleExamChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition duration-150"
                disabled={!searchData.examLevel}
              >
                <option value="">Select Exam</option>
                {exams
                  .filter((exam) => exam.level === searchData.examLevel)
                  .map((exam) => (
                    <option key={exam.name} value={exam.name}>
                      {exam.name}
                    </option>
                  ))}
              </select>
            </div> */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Session
                            </label>
                            <Select
                                name="session"
                                options={sessionOptions}
                                value={sessionOptions.find(
                                    (opt) => opt.value === searchData.session
                                )}
                                onChange={handleSessionChange}
                                className="basic-single-select"
                                classNamePrefix="select"
                                placeholder="Select session..."
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
                        {/* <div className="flex-1 min-w-[200px]">
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
            </div> */}
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
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSearchDisabled}
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

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
                            {searched ? (
                                students.length > 0 ? (
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
                                                    onClick={() => openAdmitCardModal(stu)}
                                                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition duration-150"
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
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    </svg>
                                                    Generate Admit Card
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
                                            {noStudentsFound ? "No students found" : "Loading students..."}
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        Please apply filters to view students
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {searched && totalPages > 1 && (
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

                {isModalOpen && selectedStudent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Admit Card Preview</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700"
                                    disabled={isDownloading || isGenerating}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div
                                id="admitCard"
                                className="p-8"
                                ref={admitCardRef}
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '13px',
                                    lineHeight: '1.6',
                                    color: '#000000',
                                    backgroundColor: '#ffffff',
                                }}
                            >
                                <div className="text-center mb-6">
                                    <img src={logo} alt="IQ Nexus" className="mx-auto h-12 mb-2" />
                                    <h1
                                        className="font-semibold uppercase"
                                        style={{ fontSize: '16px' }}
                                    >
                                        International Aptitude Olympiad
                                    </h1>
                                    <p
                                        className="font-medium uppercase"
                                        style={{ padding: '3px 0' }}
                                    >
                                        {searchData.examLevel === 'L1' ? 'Basic Exam' : searchData.examLevel === 'L2' ? 'Advanced Exam' : 'Exam Level Not Selected'}
                                    </p>
                                    {/* <p
                    className="font-medium uppercase"
                    style={{ padding: '3px 0' }}
                  >
                    Exam: {searchData.exam || 'Not Selected'}
                  </p> */}
                                    <p
                                        className="font-medium uppercase"
                                        style={{ padding: '3px 0' }}
                                    >
                                        Session: {searchData.session || 'Not Selected'}
                                    </p>
                                    <h2
                                        className="font-bold uppercase underline mt-2"
                                        style={{ fontSize: '14px' }}
                                    >
                                        Admit Card
                                    </h2>
                                </div>

                                <div
                                    className="grid grid-cols-2 mb-6 gap-y-2"
                                    style={{ fontSize: '13px', lineHeight: '1.6' }}
                                >
                                    <div>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>School Name:</strong> {school.schoolName || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>School Code:</strong> {selectedStudent.schoolCode || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>City:</strong> {school.city || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Area:</strong> {school.area || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Class:</strong> {selectedStudent.class || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Section:</strong> {selectedStudent.section || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Exam Incharge:</strong> {school.incharge || 'N/A'}
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Print Date:</strong> {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="border p-4 rounded-md shadow mb-6"
                                    style={{ borderColor: '#000000' }}
                                >
                                    <div className="text-center mb-2">
                                        <h3
                                            className="font-semibold uppercase"
                                            style={{ fontSize: '13px' }}
                                        >
                                            Admit Card
                                        </h3>
                                        <p
                                            className="font-medium"
                                            style={{ fontSize: '14px', padding: '3px 0' }}
                                        >
                                            Roll No: {selectedStudent.rollNo}
                                        </p>
                                    </div>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Name:</strong> {selectedStudent.studentName}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Father's Name:</strong>{' '}
                                        {selectedStudent.fatherName || 'N/A'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Mother's Name:</strong>{' '}
                                        {selectedStudent.motherName || 'N/A'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Class:</strong> {selectedStudent.class || 'N/A'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Section:</strong> {selectedStudent.section || 'N/A'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Exam Date:</strong> {'________'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Exam Time:</strong> {'________'}
                                    </p>
                                    <p style={{ padding: '3px 0' }}>
                                        <strong>Exam Venue:</strong> {'________'}
                                    </p>
                                    <div className="mt-2">
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Signature of Student:</strong> __________________
                                        </p>
                                        <p style={{ padding: '3px 0' }}>
                                            <strong>Signature of Authority:</strong> _______________
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="border-t pt-2 mb-8"
                                    style={{ borderColor: '#000000', fontSize: '13px', lineHeight: '1.6' }}
                                >
                                    <strong>IMPORTANT NOTE:</strong> Please verify all details. Admit
                                    cards must be presented during the examination. Contact school
                                    administration in case of discrepancies.
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end gap-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150"
                                    disabled={isDownloading || isGenerating}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={downloadAdmitCard}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDownloading || isGenerating}
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
                                <button
                                    onClick={storeAdmitCard}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDownloading || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        "Genrate"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmitCard;