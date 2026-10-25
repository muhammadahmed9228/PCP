import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchTeams, registerNewTeam } from "../store/teamSlice";
import { registerTeamSchema } from "../validations/team.schema";
import Modal from "../../../components/shared/Modal";

const TeamManagementPage = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(registerTeamSchema),
    defaultValues: {
      leader: { states: [] },
      member: { states: [] }
    }
  });

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = async (data) => {
    // Auto-map 'F' state if gender is Female
    if (data.leader.gender === "Female" && !data.leader.states.includes("F")) {
      data.leader.states.push("F");
    }
    if (data.member.gender === "Female" && !data.member.states.includes("F")) {
      data.member.states.push("F");
    }
    
    const resultAction = await dispatch(registerNewTeam(data));
    if (registerNewTeam.fulfilled.match(resultAction)) {
      setIsModalOpen(false);
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Field Teams</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
          + Register New Team
        </button>
      </div>

      {loading ? (
        <p>Loading teams...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leader</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team.teamNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{team.teamType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{team.leader.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{team.username}</td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No teams registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Field Team">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Number</label>
              <input type="text" {...register("teamNo")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              {errors.teamNo && <p className="text-red-600 text-xs">{errors.teamNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Type</label>
              <select {...register("teamType")} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white">
                <option value="">Select Type</option>
                <option value="Mobile">Mobile</option>
                <option value="Fixed">Fixed</option>
                <option value="Transit">Transit</option>
              </select>
              {errors.teamType && <p className="text-red-600 text-xs">{errors.teamType.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username (CNIC)</label>
              <input type="text" {...register("username")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              {errors.username && <p className="text-red-600 text-xs">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" {...register("password")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              {errors.password && <p className="text-red-600 text-xs">{errors.password.message}</p>}
            </div>
          </div>

          <hr className="my-4" />
          <h4 className="font-semibold text-gray-700">Leader Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder="Leader Name" {...register("leader.name")} className="px-3 py-2 border w-full rounded-md" />
              {errors.leader?.name && <p className="text-red-600 text-xs">{errors.leader.name.message}</p>}
            </div>
            <div>
              <input type="text" placeholder="Leader CNIC" {...register("leader.cnic")} className="px-3 py-2 border w-full rounded-md" />
              {errors.leader?.cnic && <p className="text-red-600 text-xs">{errors.leader.cnic.message}</p>}
            </div>
            <div>
              <select {...register("leader.gender")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.leader?.gender && <p className="text-red-600 text-xs">{errors.leader.gender.message}</p>}
            </div>
            <div>
              <select {...register("leader.roleType")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">Role Type</option>
                <option value="LHW">LHW</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              {errors.leader?.roleType && <p className="text-red-600 text-xs">{errors.leader.roleType.message}</p>}
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="G" {...register("leader.states")} className="mr-2" />
                Govt Employee (G)
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="L" {...register("leader.states")} className="mr-2" />
                Local Person (L)
              </label>
            </div>
          </div>

          <hr className="my-4" />
          <h4 className="font-semibold text-gray-700">Member Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder="Member Name" {...register("member.name")} className="px-3 py-2 border w-full rounded-md" />
              {errors.member?.name && <p className="text-red-600 text-xs">{errors.member.name.message}</p>}
            </div>
            <div>
              <input type="text" placeholder="Member CNIC" {...register("member.cnic")} className="px-3 py-2 border w-full rounded-md" />
              {errors.member?.cnic && <p className="text-red-600 text-xs">{errors.member.cnic.message}</p>}
            </div>
            <div>
              <select {...register("member.gender")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.member?.gender && <p className="text-red-600 text-xs">{errors.member.gender.message}</p>}
            </div>
            <div>
              <select {...register("member.roleType")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">Role Type</option>
                <option value="LHW">LHW</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              {errors.member?.roleType && <p className="text-red-600 text-xs">{errors.member.roleType.message}</p>}
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="G" {...register("member.states")} className="mr-2" />
                Govt Employee (G)
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="L" {...register("member.states")} className="mr-2" />
                Local Person (L)
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {loading ? "Registering..." : "Register Team"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagementPage;