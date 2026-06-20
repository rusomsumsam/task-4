import { useState } from "react";

import axios from "axios";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

const LoginPage = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

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
                "http://localhost:3001/api/auth/login",
                formData
            );

            const token = response.data.data.token;

            localStorage.setItem("token", token);

            toast.success("Login successful");

            navigate("/dashboard");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Login failed"
            );


        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Login
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

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
                        className="w-full bg-black text-white py-3 rounded-lg"
                    >
                        {
                            loading
                                ? "Loading..."
                                : "Login"
                        }
                    </button>

                </form>

                <p className="mt-4 text-center">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-blue-500 ml-2"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default LoginPage;