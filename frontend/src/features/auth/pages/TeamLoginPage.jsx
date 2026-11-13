import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginTeamUser } from "../store/authSlice";

const TeamLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginTeamUser(data));
    if (loginTeamUser.fulfilled.match(resultAction)) {
      navigate("/dashboard/team");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-6">Field Worker Login</h2>
        <p>M: 34567898765 , 1122334455667</p>
        <p>F: 3740637899185</p>
        <p>T: 3740637899186</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">CNIC (Username)</label>
            <input type="text" {...register("username")} className="mt-1 block w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" {...register("password")} className="mt-1 block w-full px-3 py-2 border rounded-md" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md font-medium shadow hover:bg-blue-700">
            {loading ? "Signing in..." : "Start Shift"}
          </button>
        </form>
        
        <a href="/login" className="w-full bg-blue-400 text-white py-2 rounded-md font-medium shadow m-6 p-6 hover:bg-blue-700">UCI/ AIC Login</a>
      </div>
      

    </div>
  );
};

export default TeamLoginPage;
