import { useState } from "react";
import { Upload, User, Mail, Calendar, Building2, Heart, Target, Clock } from "lucide-react";

export default function UserLoginFlow() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        year: "",
        faculty: "",
        interests: "",
        endGoal: "",
        timeline: "",
        resume: null,
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf" || file.type.includes("document")) {
                setFormData((prev) => ({
                    ...prev,
                    resume: file,
                }));
                setErrors((prev) => ({
                    ...prev,
                    resume: "",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    resume: "Please upload a PDF or document file",
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.year) newErrors.year = "Year is required";
        if (!formData.faculty.trim()) newErrors.faculty = "Faculty is required";
        if (!formData.interests.trim()) newErrors.interests = "Interests/hobbies are required";
        if (!formData.endGoal.trim()) newErrors.endGoal = "End goal is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            console.log("Form submitted:", formData);
            setSubmitted(true);

            // Reset form after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    name: "",
                    email: "",
                    year: "",
                    faculty: "",
                    interests: "",
                    endGoal: "",
                    timeline: "",
                    resume: null,
                });
            }, 3000);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
                    <p className="text-gray-600">Welcome, {formData.name}! Your profile has been created successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Profile</h1>
                        <p className="text-gray-600">Tell us about yourself and your goals</p>
                    </div>

                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 mr-2" />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.name ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Year */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2" />
                                Year *
                            </label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.year ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                            >
                                <option value="">Select your year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year+</option>
                                <option value="graduate">Graduate</option>
                            </select>
                            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                        </div>

                        {/* Faculty */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Building2 className="w-4 h-4 mr-2" />
                                Faculty/Department *
                            </label>
                            <input
                                type="text"
                                name="faculty"
                                value={formData.faculty}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.faculty ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                                placeholder="e.g., Computer Science, Business, Engineering"
                            />
                            {errors.faculty && <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>}
                        </div>

                        {/* Interests/Hobbies */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Heart className="w-4 h-4 mr-2" />
                                Interests & Hobbies *
                            </label>
                            <textarea
                                name="interests"
                                value={formData.interests}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.interests ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none`}
                                placeholder="Tell us about your interests, hobbies, and passions..."
                            />
                            {errors.interests && <p className="text-red-500 text-sm mt-1">{errors.interests}</p>}
                        </div>

                        {/* End Goal */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Target className="w-4 h-4 mr-2" />
                                End Goal *
                            </label>
                            <textarea
                                name="endGoal"
                                value={formData.endGoal}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.endGoal ? "border-red-500" : "border-gray-300"
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none`}
                                placeholder="What do you hope to achieve? What's your ultimate goal?"
                            />
                            {errors.endGoal && <p className="text-red-500 text-sm mt-1">{errors.endGoal}</p>}
                        </div>

                        {/* Timeline */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 mr-2" />
                                Timeline (Optional)
                            </label>
                            <input
                                type="text"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="e.g., 6 months, 1 year, by graduation"
                            />
                            <p className="text-sm text-gray-500 mt-1">When would you like to achieve your goal?</p>
                        </div>

                        {/* Resume Upload */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Upload className="w-4 h-4 mr-2" />
                                Resume (Optional)
                            </label>
                            <div className="relative">
                                <input type="file" id="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                                <label
                                    htmlFor="resume"
                                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
                                >
                                    <Upload className="w-5 h-5 mr-2 text-gray-400" />
                                    <span className="text-gray-600">{formData.resume ? formData.resume.name : "Click to upload resume"}</span>
                                </label>
                            </div>
                            {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                            <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                        </div>

                        {/* Submit Button */}
                        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl">
                            Create Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
