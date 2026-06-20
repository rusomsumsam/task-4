import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Lock,
    LockOpen,
    Trash2,
    Filter,
    ChevronDown,
    User,
    Mail,
    Clock,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";

const DashboardPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [loadingAction, setLoadingAction] = useState("");

    const formatLastSeen = (date) => {
        const now = new Date();
        const lastSeen = new Date(date);
        const diffInSeconds = Math.floor((now - lastSeen) / 1000);
        if (diffInSeconds < 60) return "Just now";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                "https://task-4-se4e.onrender.com/api/users",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const fetchedUsers = response.data.data;
            setUsers(fetchedUsers);
            const payload = JSON.parse(atob(token.split(".")[1]));
            setCurrentUserId(payload.userId);
        } catch (error) {
            console.log(error);
            toast.error("Unauthorized");
            localStorage.removeItem("token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            const allUserIds = users.map((user) => user._id);
            setSelectedUsers(allUserIds);
        }
    };

    const handleBulkBlock = async () => {
        try {
            setLoadingAction("block");
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                "https://task-4-se4e.onrender.com/api/users/bulk-block",
                { userIds: selectedUsers },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message);
            if (response.data.data.logout) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error("Block failed");
        } finally {
            setLoadingAction("");
        }
    };

    const handleBulkUnblock = async () => {
        try {
            setLoadingAction("unblock");
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                "https://task-4-se4e.onrender.com/api/users/bulk-unblock",
                { userIds: selectedUsers },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.error(response.data.message);
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error("Unblock failed");
        } finally {
            setLoadingAction("");
        }
    };

    const handleBulkDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete selected users?");
        if (!confirmDelete) return;
        try {
            setLoadingAction("delete");
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "https://task-4-se4e.onrender.com/api/users/bulk-delete",
                { userIds: selectedUsers },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.error(response.data.message);
            if (response.data.data.logout) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error("Delete failed");
        } finally {
            setLoadingAction("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        document.title = "Dashboard";
        if (token) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, []);

    if (!token) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage users and permissions</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>Logout</span>
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm font-medium text-slate-600">Selected:</span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{selectedUsers.length}</span>
                    </div>

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                    <button
                        onClick={handleBulkBlock}
                        disabled={selectedUsers.length === 0 || loadingAction === "block"}
                        className="flex items-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Lock size={16} />
                        {loadingAction === "block" ? "Processing..." : "Block"}
                    </button>

                    <button
                        onClick={handleBulkUnblock}
                        disabled={selectedUsers.length === 0 || loadingAction === "unblock"}
                        className="flex items-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <LockOpen size={16} />
                        {loadingAction === "unblock" ? "Processing..." : "Unblock"}
                    </button>

                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedUsers.length === 0 || loadingAction === "delete"}
                        className="flex items-center gap-2 w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Trash2 size={16} />
                        {loadingAction === "delete" ? "Processing..." : "Delete"}
                    </button>

                    <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56">
                            <input
                                type="text"
                                placeholder="Filter users..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="p-4 w-12">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={users.length > 0 && selectedUsers.length === users.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4 min-w-[200px]">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                                <User size={14} />
                                                Name
                                                <ChevronDown size={14} className="opacity-50" />
                                            </div>
                                        </th>
                                        <th className="p-4 min-w-[200px]">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                                <Mail size={14} />
                                                Email
                                            </div>
                                        </th>
                                        <th className="p-4 min-w-[120px]">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                                Status
                                            </div>
                                        </th>
                                        <th className="p-4 min-w-[160px] hidden lg:table-cell">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                                <Clock size={14} />
                                                Last Login
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center p-12 text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <User size={40} className="opacity-20" />
                                                    <p>No users found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user._id}
                                                className={`transition hover:bg-slate-50/80 ${user._id === currentUserId ? "bg-blue-50/60" : ""}`}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedUsers.includes(user._id)}
                                                        onChange={() => handleSelectUser(user._id)}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-800">{user.name}</span>
                                                            <span className="text-xs text-slate-400">{user._id === currentUserId ? "You" : user.role || "User"}</span>
                                                        </div>
                                                        {user._id === currentUserId && (
                                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 ml-auto">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.status === "blocked" ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
                                                        {user.status === "blocked" ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500 hidden lg:table-cell">
                                                    {formatLastSeen(user.lastLogin)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;