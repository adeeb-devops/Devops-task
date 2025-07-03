import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Lock } from "@mui/icons-material";

const BackLogin = () => {
  const [formData, setFormData] = useState({
    distributor_id: "",
    distributor_key: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!formData.distributor_id || !formData.distributor_key) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/login`,
        { ...formData },
        {
          headers: {
            token: `${import.meta.env.VITE_APP_TOKEN}`,
          },
        }
      );
      // console.log("login response",response);
      if (response.data.success) {
        const { token } = response.data.data;
        const { name, role } =
          response.data.data.distributor || response.data.data.manager;
        sessionStorage.setItem("clientToken", token);
        sessionStorage.setItem("clientName", name);
        sessionStorage.setItem("clientRole", role);
        navigate("/back-office/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
 
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-black p-5 border shadow-gray-300 shadow rounded-lg max-w-lg w-full">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-color tracking-wider">
            Back Office
          </h2>
          <p className="text-gray-500 mt-0.5">Please log in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold tracking-wider text-color mb-1">
              Distributor ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="distributor_id"
                value={formData.distributor_id}
                onChange={handleInputChange}
                className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Enter your id"
              />
            </div>
          </div>
          <div>
            <label className="block tracking-wider font-bold text-gray-700 mb-1">
              Distributor Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="distributor_key"
                value={formData.distributor_key}
                onChange={handleInputChange}
                className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Enter your key"
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            disabled={isLoading}
            type="submit"
            className="flex justify-center items-center w-full bg-color text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            {!isLoading ? (
              "Login"
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-transparent border-white mx-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BackLogin;
