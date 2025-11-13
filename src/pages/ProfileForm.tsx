import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, User, Mail, Calendar, Building2, Heart, Target, Clock, Share2 } from "lucide-react";

const API_BASE = "http://35.86.86.5:8000";

type ProfileFormState = {
    name: string;
    email: string;
    year: string;
    faculty: string;
    interests: string;
    endGoal: string;
    timeline: string;
    resume: File | null;
};

const createInitialFormState = (): ProfileFormState => ({
    name: "",
    email: "",
    year: "",
    faculty: "",
    interests: "",
    endGoal: "",
    timeline: "",
    resume: null,
});

export default function ProfileFormPage() {
    const [formData, setFormData] = useState<ProfileFormState>(createInitialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (allowedTypes.includes(file.type)) {
            setFormData((prev) => ({
                ...prev,
                resume: file,
            }));
            if (errors.resume) {
                setErrors((prev) => ({
                    ...prev,
                    resume: "",
                }));
            }
        } else {
            setErrors((prev) => ({
                ...prev,
                resume: "Please upload a PDF or Word document",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("year", formData.year);
            formDataToSend.append("faculty", formData.faculty);
            formDataToSend.append("interests", formData.interests);
            formDataToSend.append("end_goal", formData.endGoal);
            formDataToSend.append("timeline", formData.timeline);

            if (formData.resume) {
                formDataToSend.append("resume", formData.resume);
            }

            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                body: formDataToSend,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Registration failed");
            }

            const result = await response.json();
            console.log("Registration successful:", result);

            // Store user_id for the network page
            if (result.user_id) {
                sessionStorage.setItem("user_id", String(result.user_id));
            }

            // Optional: reset form before navigation
            setFormData(createInitialFormState());
            setErrors({});

            // 🔥 Navigate to /network after success
            navigate("/network");
        } catch (error) {
            console.error("Registration error:", error);
            setErrors((prev) => ({
                ...prev,
                submit: error instanceof Error ? error.message : "Something went wrong. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-12 px-4">
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="text-center space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Pathfinder</p>
                    <h1 className="text-4xl font-bold text-slate-900">Create Your Profile</h1>
                    <p className="text-lg text-slate-600">Tell us about yourself so we can align you with opportunities across the Pathfinder network.</p>
                </header>

                <section className="bg-white rounded-2xl shadow-xl p-8 border border-white/70">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                                <User className="w-4 h-4 mr-2" />
                                Full Name *
                            </label>
                            <input
                                id="name"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Address *
                            </label>
                            <input
                                id="email"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="year">
                                <Calendar className="w-4 h-4 mr-2" />
                                Year *
                            </label>
                            <select
                                id="year"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="faculty">
                                <Building2 className="w-4 h-4 mr-2" />
                                Faculty/Department *
                            </label>
                            <input
                                id="faculty"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="interests">
                                <Heart className="w-4 h-4 mr-2" />
                                Interests & Hobbies *
                            </label>
                            <textarea
                                id="interests"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="endGoal">
                                <Target className="w-4 h-4 mr-2" />
                                End Goal *
                            </label>
                            <textarea
                                id="endGoal"
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

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="timeline">
                                <Clock className="w-4 h-4 mr-2" />
                                Timeline (Optional)
                            </label>
                            <input
                                id="timeline"
                                type="text"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="e.g., 6 months, 1 year, by graduation"
                            />
                            <p className="text-sm text-gray-500 mt-1">When would you like to achieve your goal?</p>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="resume">
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

                        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Create Profile"}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl border border-indigo-100 bg-white/70 p-6 text-center shadow">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Next</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">See the Network Graph</h2>
                    <p className="mt-1 text-sm text-slate-600">Jump to the dedicated graph page to explore how Pathfinder profiles connect to curated events.</p>
                    <Link
                        to="/network"
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/60 hover:bg-indigo-500"
                    >
                        View network
                        <Share2 className="h-4 w-4" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
