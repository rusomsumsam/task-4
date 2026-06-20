import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import axios from "axios";

const RegisterPage = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    ``

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await axios.post(
                "https://task-4-se4e.onrender.com/api/auth/register",
                formData
            );

            console.log(response.data);

            toast.success("Registration successful");

            navigate("/login");

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg outline-none"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg outline-none"
                    />

                    <div className="relative">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg outline-none"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-3 top-3 text-sm text-gray-600"
                        >
                            {
                                showPassword
                                    ? "Hide"
                                    : "Show"
                            }
                        </button>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg cursor-pointer"
                    >
                        {
                            loading
                                ? "Loading..."
                                : "Register"
                        }
                    </button>

                </form>

                <p className="mt-4 text-center">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-500 ml-2"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default RegisterPage;