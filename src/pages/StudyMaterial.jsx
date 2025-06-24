import React from 'react';
import { BASE_URL } from '../Api';

const StudyMaterial = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        class: '',
        subject: '',
        fee: '',
        pdf: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'pdf') {
            setFormData({ ...formData, pdf: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('class', formData.class);
        data.append('subject', formData.subject);
        data.append('fee', formData.fee);
        if (formData.pdf) {
            data.append('file', formData.pdf);
        }

        try {
            await fetch(`${BASE_URL}/addStudentStudyMaterial`, {
                method: 'POST',
                body: data,
            });
            alert('Study material uploaded successfully!');
        } catch (error) {
            alert('Failed to upload study material.');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">Study Material</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="class" className="block mb-1 font-medium">Class:</label>
                    <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Class</option>
                        <option value="kindergarten">Kindergarten</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="subject" className="block mb-1 font-medium">Subject:</label>
                    <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Subject</option>
                        <option value="IAOL1Book">IQRO</option>
                        <option value="ITSTL1Book">IQSO</option>
                        <option value="IMOL1Book">IQMO</option>
                        <option value="IGKOL1Book">IQGKO</option>
                        <option value="IENGOL1Book">IQEO</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="fee" className="block mb-1 font-medium">Fee:</label>
                    <input
                        type="number"
                        id="fee"
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="pdf" className="block mb-1 font-medium">Upload PDF:</label>
                    <input
                        type="file"
                        id="pdf"
                        name="pdf"
                        accept="application/pdf"
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                >
                    Save
                </button>
            </form>
        </div>
    );
};

export default StudyMaterial;