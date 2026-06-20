import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-10 font-sans">
            {/* Header & Logout */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                    Logout
                </button>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <button
                    onClick={handleBulkBlock}
                    disabled={selectedUsers.length === 0 || loadingAction === "block"}
                    className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    {loadingAction === "block" ? "Processing..." : "Block"}
                </button>
                <button
                    onClick={handleBulkUnblock}
                    disabled={selectedUsers.length === 0 || loadingAction === "unblock"}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 018 0v4M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    {loadingAction === "unblock" ? "Processing..." : "Unblock"}
                </button>
                <button
                    onClick={handleBulkDelete}
                    disabled={selectedUsers.length === 0 || loadingAction === "delete"}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {loadingAction === "delete" ? "Processing..." : "Delete"}
                </button>
                <div className="ml-auto hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter"
                            className="pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 text-lg font-medium">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-white border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={users.length > 0 && selectedUsers.length === users.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-gray-600 font-medium">Name</th>
                                <th className="p-4 text-gray-600 font-medium">Email</th>
                                <th className="p-4 text-gray-600 font-medium">Status</th>
                                <th className="p-4 text-gray-600 font-medium">Last seen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className={`hover:bg-gray-50 transition-colors ${user._id === currentUserId ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => handleSelectUser(user._id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                                {user._id === currentUserId && (
                                                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "blocked"
                                                        ? "bg-red-100 text-red-700"
                                                        : user.status === "unverified"
                                                            ? "bg-gray-100 text-gray-600"
                                                            : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {formatLastSeen(user.lastLogin)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;