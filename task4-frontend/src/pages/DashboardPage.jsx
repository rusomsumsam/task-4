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

    const [actionLoading, setActionLoading] = useState(false);


    const fetchUsers = async () => {

        try {

            const response = await axios.get(
                "https://task-4-se4e.onrender.com/api/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const fetchedUsers = response.data.data;

            setUsers(fetchedUsers);

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

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

            setSelectedUsers(
                selectedUsers.filter(
                    (id) => id !== userId
                )
            );

        } else {

            setSelectedUsers([
                ...selectedUsers,
                userId
            ]);
        }
    };


    const handleSelectAll = () => {

        if (
            selectedUsers.length === users.length
        ) {

            setSelectedUsers([]);

        } else {

            const allUserIds = users.map(
                (user) => user._id
            );

            setSelectedUsers(allUserIds);
        }
    };

    const handleBulkBlock = async () => {

        try {

            setActionLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                "https://task-4-se4e.onrender.com/api/users/bulk-block",
                {
                    userIds: selectedUsers
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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

            setActionLoading(false);
        }
    };

    const handleBulkUnblock = async () => {

        try {
            setActionLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                "https://task-4-se4e.onrender.com/api/users/bulk-unblock",
                {
                    userIds: selectedUsers
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.error(response.data.message);

            await fetchUsers();

            setSelectedUsers([]);

        } catch (error) {

            console.log(error);

            toast.error("Unblock failed");
        } finally {

            setActionLoading(false);
        }

    };

    const handleBulkDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete selected users?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            setActionLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.delete(
                "https://task-4-se4e.onrender.com/api/users/bulk-delete",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: {
                        userIds: selectedUsers
                    }
                }
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

            setActionLoading(false);
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

        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>

                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Dashboard
                    </h1>

                    <p>
                        Selected Users: {selectedUsers.length}
                    </p>

                </div>

                <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>

            </div>

            <div className="flex flex-wrap gap-4 mb-6">


                <button
                    onClick={handleBulkBlock}
                    disabled={
                        selectedUsers.length === 0 ||
                        actionLoading
                    }
                    className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {
                        actionLoading
                            ? "Processing..."
                            : "Block"
                    }
                </button>

                <button
                    onClick={handleBulkUnblock}
                    disabled={
                        selectedUsers.length === 0 ||
                        actionLoading
                    }
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {
                        actionLoading
                            ? "Processing..."
                            : "Unblock"
                    }
                </button>

                <button
                    onClick={handleBulkDelete}
                    disabled={
                        selectedUsers.length === 0 ||
                        actionLoading
                    }
                    className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {
                        actionLoading
                            ? "Processing..."
                            : "Delete"
                    }
                </button>

            </div>


            {
                loading ? (

                    <div className="text-center text-xl font-semibold">
                        Loading...
                    </div>

                ) : (

                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">

                        <table className="min-w-full border-collapse text-sm md:text-base">

                            <thead className="bg-black text-white">

                                <tr>

                                    <th className="p-2 md:p-4">

                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 cursor-pointer"
                                            checked={
                                                users.length > 0 &&
                                                selectedUsers.length === users.length
                                            }
                                            onChange={handleSelectAll}
                                        />

                                    </th>

                                    <th className="p-2 md:p-4 text-left">
                                        Name
                                    </th>

                                    <th className="hidden md:table-cell p-2 md:p-4 text-left">
                                        Email
                                    </th>

                                    <th className="p-2 md:p-4 text-left">
                                        Status
                                    </th>

                                    <th className="hidden lg:table-cell p-2 md:p-4 text-left">
                                        Last Login
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {
                                    users.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="text-center p-6"
                                            >
                                                No users found
                                            </td>

                                        </tr>

                                    ) : (

                                        users.map((user) => (

                                            <tr
                                                key={user._id}
                                                className={
                                                    user._id === currentUserId
                                                        ? "border-b bg-blue-50 hover:bg-blue-100 transition"
                                                        : "border-b hover:bg-gray-50 transition"
                                                }
                                            >

                                                <td className="p-2 md:p-4">

                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 cursor-pointer"
                                                        checked={
                                                            selectedUsers.includes(user._id)
                                                        }
                                                        onChange={() =>
                                                            handleSelectUser(user._id)
                                                        }
                                                    />

                                                </td>

                                                <td className="p-2 md:p-4">

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                        <span>
                                                            {user.name}
                                                        </span>

                                                        {
                                                            user._id === currentUserId && (

                                                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                                    You
                                                                </span>
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                <td className="hidden md:table-cell p-2 md:p-4">
                                                    {user.email}
                                                </td>

                                                <td className="p-2 md:p-4 text-center">


                                                    <span

                                                        className={
                                                            user.status === "blocked"
                                                                ? "bg-red-100 text-red-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
                                                                : "bg-green-100 text-green-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
                                                        }

                                                    >
                                                        {user.status}
                                                    </span>

                                                </td>

                                                <td className="hidden lg:table-cell p-2 md:p-4">
                                                    {
                                                        new Date(
                                                            user.lastLogin
                                                        ).toLocaleString("en-BD")
                                                    }
                                                </td>

                                            </tr>
                                        ))
                                    )
                                }

                            </tbody>

                        </table>

                    </div>
                )
            }

        </div>
    );
};

export default DashboardPage;