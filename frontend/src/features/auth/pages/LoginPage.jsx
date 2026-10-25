import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, loginAicUser } from "../store/authSlice";
import { loginSchema } from "../validations/auth.schema";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "UCI" }
  });

  const onSubmit = async (data) => {
    if (data.role === "AIC") {
      const resultAction = await dispatch(loginAicUser(data));
      if (loginAicUser.fulfilled.match(resultAction)) {
        navigate("/dashboard/aic");
      }
    } else {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate("/dashboard/uci");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Polio Campaign Monitoring System
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="flex justify-center space-x-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="UCI"
                {...register("role")}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Login as UCI</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="AIC"
                {...register("role")}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Login as AIC</span>
            </label>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600 text-center">{errors.role.message}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username (CNIC)
            </label>
            <input
              type="text"
              {...register("username")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your CNIC"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            Register as UCI
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;