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
    const [filterText, setFilterText] = useState("");

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
            toast.error(
                "Your session expired or your account was blocked. Please login again."
            );
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
                toast.error(
                    "Your account has been blocked."
                );

                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message ||
                "Unable to block selected users. Please try again."
            );
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
            toast.success(response.data.message);
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message ||
                "Unable to unblock selected users. Please refresh and try again."
            );
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
            toast.success(response.data.message);
            if (response.data.data.logout) {
                toast.error(
                    "Your account has been deleted."
                );

                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            await fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message ||
                "Unable to delete selected users. Please try again."
            );
        } finally {
            setLoadingAction("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const filteredUsers = users.filter((user) => {
        if (!filterText) return true;
        const searchLower = filterText.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.status.toLowerCase().includes(searchLower)
        );
    });

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
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                    Logout
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <button
                    onClick={handleBulkBlock}
                    disabled={selectedUsers.length === 0 || loadingAction === "block"}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    {loadingAction === "block" ? "Processing..." : "Block"}
                </button>
                <button
                    onClick={handleBulkUnblock}
                    disabled={selectedUsers.length === 0 || loadingAction === "unblock"}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 018 0v4M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    {loadingAction === "unblock" ? "Processing..." : "Unblock"}
                </button>
                <button
                    onClick={handleBulkDelete}
                    disabled={selectedUsers.length === 0 || loadingAction === "delete"}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {loadingAction === "delete" ? "Processing..." : "Delete"}
                </button>
                <div className="ml-auto hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-48 shadow-sm"
                        />
                        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        {filterText && (
                            <button
                                onClick={() => setFilterText("")}
                                className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-600 text-lg font-medium">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Last seen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        {users.length === 0 ? "No users found" : "No results match your filter"}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user._id}
                                        className={`hover:bg-gray-100 transition-colors ${user._id === currentUserId ? "bg-blue-50" : ""}`}
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
                                        <td className="p-4 text-gray-700">{user.email}</td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "blocked"
                                                    ? "bg-red-100 text-red-700"
                                                    : user.status === "unverified"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
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