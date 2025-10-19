import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
    LayoutDashboard,
    FileText,
    Package,
    MessageSquare,
    BarChart3,
    Settings,
    LogOut,
    X,
    Sheet,
    AlertTriangle,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout, userProfile } = useAuth();
    const navigate = useNavigate();
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        fetchAlertCount();
        // Refresh alert count every 30 seconds
        const interval = setInterval(fetchAlertCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlertCount = async () => {
        try {
            const response = await api.get("/alerts?status=active");
            setAlertCount(response.alerts?.length || 0);
        } catch (error) {
            console.error("Failed to fetch alert count:", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Files", path: "/files", icon: FileText },
        { name: "Inventory", path: "/inventory", icon: Package },
        { name: "Google Sheets", path: "/google-sheets", icon: Sheet },
        { name: "AI Assistant", path: "/chat", icon: MessageSquare },
        { 
            name: "Alerts", 
            path: "/alerts", 
            icon: AlertTriangle,
            badge: alertCount > 0 ? alertCount : null,
        },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Close Button */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                                <span className="text-xl font-bold text-white">Fi</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Finxan AI
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Inventory Manager
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                    {userProfile?.name?.[0]?.toUpperCase() || "U"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {userProfile?.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {userProfile?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
