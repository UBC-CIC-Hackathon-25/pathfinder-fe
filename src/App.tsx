import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import ProfileFormPage from "./pages/ProfileForm";
import NetworkGraphPage from "./pages/NetworkGraph";

const linkBase =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${
        isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300/60 focus-visible:outline-indigo-600"
            : "text-slate-600 hover:text-indigo-600 focus-visible:outline-indigo-500"
    }`;

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-900">
                <header className="border-b border-white/60 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                        <NavLink to="/" className="text-xl font-bold tracking-tight text-indigo-700">
                            Pathfinder
                        </NavLink>
                        <nav className="flex gap-3">
                            <NavLink to="/" className={getNavClass} end>
                                Profile
                            </NavLink>
                            <NavLink to="/network" className={getNavClass}>
                                Network Graph
                            </NavLink>
                        </nav>
                    </div>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<ProfileFormPage />} />
                        <Route path="/network" element={<NetworkGraphPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
