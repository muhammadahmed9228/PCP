import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

const SectionSchoolsAndOthers = () => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "schools"
  });

  return (
    <div className="space-y-6">
      {/* SECTION 7 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">Section 7: School / Madrasa</h3>
          <button 
            type="button" 
            onClick={() => append({})} 
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={fields.length >= 4}
          >
            + Add School ({fields.length}/4)
          </button>
        </div>
        
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">Skip if no school/madrasa on route.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Sr</th>
                  <th className="p-2 border">School/Madrasa No</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Children &lt; 5 yrs</th>
                  <th className="p-2 border">Vaccinated (S)</th>
                  <th className="p-2 border">X</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="text-center">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border"><input {...register(`schools.${index}.schoolNo`)} className="w-full px-1 border" required /></td>
                    <td className="p-2 border"><input {...register(`schools.${index}.schoolName`)} className="w-full px-1 border" required /></td>
                    <td className="p-2 border"><input type="number" {...register(`schools.${index}.childrenUnder5`)} className="w-20 px-1 border" /></td>
                    <td className="p-2 border"><input type="number" {...register(`schools.${index}.vaccinated`)} className="w-20 px-1 border" /></td>
                    <td className="p-2 border"><button type="button" onClick={() => remove(index)} className="text-red-500 font-bold">&times;</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SECTION 8 */}
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold mb-2">Section 8: Street/Market</h3>
          <label className="block text-sm text-gray-700">Total Vaccinated in Streets (D)</label>
          <input type="number" {...register("streetVaccinated")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>

        {/* SECTION 9 */}
        <div className="bg-gray-50 p-4 rounded border md:col-span-2">
          <h3 className="font-semibold mb-2">Section 9: AFP & Zero Dose</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Total AFP Cases Noticed</label>
              <input type="number" {...register("afpCasesNoticed")} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Zero Dose (RI) Recorded</label>
              <input type="number" {...register("zeroDoseRIRecorded")} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSchoolsAndOthers;