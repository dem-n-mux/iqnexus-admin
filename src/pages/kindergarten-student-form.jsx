// import React from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { BASE_URL } from "../Api";

// const KinderGartenStudentForm = () => {
//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//     } = useForm();

//     const onSubmit = async (data) => {
//         // Map form data to schema
//         const submitData = {
//             ...data,
//             class: "KG", // Enforce class as "KG"
//             IQKG1: data.IQKG1 || "0", // Default to "0" if not provided
//             Duplicates: data.Duplicates === "true" ? true : false, // Convert to boolean
//             motherName: data.motherName || "", // Default to empty string
//             fatherName: data.fatherName || "", // Default to empty string
//             dob: data.dob || "", // Default to empty string
//             mobNo: data.mobNo || "", // Default to empty string
//             city: data.city || "", // Default to empty string
//         };

//         try {
//             const response = await axios.post(`${BASE_URL}/add-kindergarten-student`, submitData);
//             alert(response.data.message);
//             reset();
//         } catch (err) {
//             console.error("Error submitting form", err);
//             alert("Failed to add student");
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-0 md:py-4 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto">
//                 <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
//                     {/* Header */}
//                     <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
//                         <h2 className="text-2xl font-bold text-white">
//                             Kindergarten Student Registration
//                         </h2>
//                         <p className="text-indigo-100 text-sm mt-1">
//                             Complete the form below to register a new kindergarten student
//                         </p>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={handleSubmit(onSubmit)} className="p-8">
//                         <div className="space-y-8">
//                             {/* Basic Information Section */}
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                     Basic Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Roll No
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("rollNo", {
//                                                 required: "Roll No is required",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter roll number"
//                                         />
//                                         {errors.rollNo && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.rollNo.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             School Code
//                                         </label>
//                                         <input
//                                             type="number"
//                                             {...register("schoolCode", {
//                                                 required: "School Code is required",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter school code"
//                                         />
//                                         {errors.schoolCode && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.schoolCode.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Section
//                                         </label>
//                                         <select
//                                             {...register("section", {
//                                                 required: "Section is required",
//                                                 validate: (value) =>
//                                                     ["LKG", "UKG", "PG"].includes(value) ||
//                                                     "Section must be LKG, UKG, or PG",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                         >
//                                             <option value="">Select Section</option>
//                                             <option value="LKG">LKG</option>
//                                             <option value="UKG">UKG</option>
//                                             <option value="PG">PG</option>
//                                         </select>
//                                         {errors.section && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.section.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Duplicates
//                                         </label>
//                                         <select
//                                             {...register("Duplicates", {
//                                                 required: "Duplicates field is required",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                         >
//                                             <option value="">Select</option>
//                                             <option value="true">Yes</option>
//                                             <option value="false">No</option>
//                                         </select>
//                                         {errors.Duplicates && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.Duplicates.message}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Personal Information Section */}
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                     Personal Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Student Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("studentName", {
//                                                 required: "Student Name is required",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter student name"
//                                         />
//                                         {errors.studentName && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.studentName.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Mother Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("motherName")}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter mother's name"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Father Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("fatherName")}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter father's name"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Date of Birth
//                                         </label>
//                                         <input
//                                             type="date"
//                                             {...register("dob")}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Mobile Number
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("mobNo", {
//                                                 pattern: {
//                                                     value: /^[0-9]{10}$/,
//                                                     message: "Mobile number must be 10 digits",
//                                                 },
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter mobile number (e.g., 7880450475)"
//                                         />
//                                         {errors.mobNo && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.mobNo.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             City
//                                         </label>
//                                         <input
//                                             type="text"
//                                             {...register("city")}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                             placeholder="Enter city"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Exam Information Section */}
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                     Exam Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             IQKG
//                                         </label>
//                                         <select
//                                             {...register("IQKG", {
//                                                 required: "IQKG participation is required",
//                                             })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
//                                         >
//                                             <option value="">Select</option>
//                                             <option value="1">Yes</option>
//                                             <option value="0">No</option>
//                                         </select>
//                                         {errors.IQKG && (
//                                             <p className="text-red-500 text-xs mt-1">
//                                                 {errors.IQKG.message}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Submit Buttons */}
//                         <div className="mt-8 flex justify-end gap-4">
//                             <button
//                                 type="button"
//                                 onClick={() => reset()}
//                                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                             >
//                                 Reset
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
//                             >
//                                 Add Student
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KinderGartenStudentForm;

import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { BASE_URL } from "../Api";

const KinderGartenStudentForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const submitData = {
      ...data,
      class: "KG",
      Duplicates: data.Duplicates === "true",
      IQKG1: data.IQKG1 || "0",
      IQKG2: data.IQKG2 || "0",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/add-kindergarten-student`,
        submitData
      );
      alert(response.data.message);
      reset();
    } catch (err) {
      console.error("Error submitting form", err);
      alert("Failed to add student");
    }
  };

  const inputField = ({ label, name, type = "text", required = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        {...register(name, required ? { required: `${label} is required` } : {})}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Kindergarten Student Registration
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Fill out all fields to register a kindergarten student.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
            {/* Section: Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputField({ label: "Roll No", name: "rollNo", required: true })}
                {inputField({ label: "School Code", name: "schoolCode", type: "number", required: true })}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    {...register("section", { required: "Section is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Select</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="PG">PG</option>
                  </select>
                  {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duplicates</label>
                  <select
                    {...register("Duplicates", { required: "Duplicates is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.Duplicates && <p className="text-red-500 text-xs mt-1">{errors.Duplicates.message}</p>}
                </div>
              </div>
            </div>

            {/* Section: Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputField({ label: "Student Name", name: "studentName", required: true })}
                {inputField({ label: "Father Name", name: "fatherName" })}
                {inputField({ label: "Mother Name", name: "motherName" })}
                {inputField({ label: "Date of Birth", name: "dob", type: "date" })}
                {inputField({ label: "Mobile No", name: "mobNo" })}
                {inputField({ label: "City", name: "city" })}
              </div>
            </div>

            {/* Section: Exam Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IQKG1</label>
                  <select
                    {...register("IQKG1")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IQKG2</label>
                  <select
                    {...register("IQKG2")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputField({ label: "Total Basic Level Participated Exams", name: "totalBasicLevelParticipatedExams" })}
                 {inputField({ label: "Basic Level Full Amount", name: "basicLevelFullAmount" })}
                {inputField({ label: "Basic Level Amount Paid", name: "basicLevelAmountPaid" })}
                {inputField({ label: "Basic Level Amount Paid Online", name: "basicLevelAmountPaidOnline" })}
                {inputField({ label: "Is Basic Level Concession Given", name: "isBasicLevelConcessionGiven" })}
                {inputField({ label: "Concession Reason", name: "concessionReason" })}
                 {inputField({ label: "Remark", name: "remark" })}
                {inputField({ label: "Advance Level Amount Paid", name: "advanceLevelAmountPaid" })}
                {inputField({ label: "Advance Level Amount Paid Online", name: "advanceLevelAmountPaidOnline" })}
                {inputField({ label: "Total Amount Paid", name: "totalAmountPaid" })}
                {inputField({ label: "Total Amount Paid Online", name: "totalAmountPaidOnline" })}                                    
              </div>
            </div>


            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KinderGartenStudentForm;
