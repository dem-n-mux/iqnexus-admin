import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import { BASE_URL } from "../Api";

const AdmitCard = () => {
  const [students, setStudents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [limit] = useState(10);
  const [noStudentsFound, setNoStudentsFound] = useState(false);
  const [searchData, setSearchData] = useState({
    schoolCode: "",
    examLevel: "",
    session: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const sessionOptions = [
    { value: "2024-25", label: "2024-25" },
    { value: "2025-26", label: "2025-26" },
    { value: "2026-27", label: "2026-27" },
  ];

  const fetchStudents = async (page, filters = {}) => {
    try {
      const hasFilters = Object.values(filters).some(
        (val) => val !== "" && val !== null && val !== undefined
      );

      if (!hasFilters) {
        setStudents([]);
        setTotalPages(1);
        setTotalStudents(0);
        setNoStudentsFound(false);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/admit-card-students?page=${page}&limit=${limit}`,
        {
          schoolCode: filters.schoolCode ? Number(filters.schoolCode) : undefined,
          examLevel: filters.examLevel || undefined,
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
      setMessage("Failed to fetch students.");
    } finally {
      setSearched(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleExamLevelChange = (e) => {
    setSearchData({ ...searchData, examLevel: e.target.value });
    setMessage("");
  };

  const handleSessionChange = (selectedOption) => {
    setSearchData({
      ...searchData,
      session: selectedOption ? selectedOption.value : "",
    });
    setMessage("");
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchStudents(1, searchData);
  };

  const handleClearFilters = () => {
    setSearchData({
      schoolCode: "",
      examLevel: "",
      session: "",
    });
    setSearched(false);
    setStudents([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalStudents(0);
    setNoStudentsFound(false);
    setMessage("");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchStudents(page, searchData);
    }
  };

  const generateAllAdmitCards = async () => {
    if (!searchData.schoolCode || !searchData.examLevel || !searchData.session) {
      setMessage("Please fill all filters.");
      return;
    }

    setIsGenerating(true);
    setMessage("");

    try {
      const res = await axios.post(`${BASE_URL}/admit-card`, {
        schoolCode: Number(searchData.schoolCode),
        level: searchData.examLevel,
        session: searchData.session,
      });

      setMessage(res.data.message);
    } catch (error) {
      console.error("Error generating admit cards:", error);
      setMessage("Failed to generate admit cards. Please try again.");
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

  const isSearchDisabled = !(
    searchData.examLevel &&
    searchData.session &&
    searchData.schoolCode
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
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                School Code
              </label>
              <input
                type="number"
                name="schoolCode"
                value={searchData.schoolCode}
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
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold text-gray-800">Students</h2>
            {students.length > 0 && (
              <button
                onClick={generateAllAdmitCards}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Generating...
                  </>
                ) : (
                  "Generate All Admit Cards"
                )}
              </button>
            )}
          </div>
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Student Name</th>
                <th className="px-6 py-3 text-left">DOB</th>
                <th className="px-6 py-3 text-left">Roll No</th>
                <th className="px-6 py-3 text-left">Mobile</th>
                <th className="px-6 py-3 text-left">School Code</th>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {noStudentsFound ? "No students found" : "Loading students..."}
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
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

        {message && (
          <div
            className={`mt-4 p-4 rounded-md text-sm ${message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
              }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmitCard;