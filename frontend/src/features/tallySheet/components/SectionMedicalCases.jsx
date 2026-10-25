import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

const SectionMedicalCases = () => {
  const { register, control } = useFormContext();
  
  const { fields: riFields, append: appendRi, remove: removeRi } = useFieldArray({ control, name: "routineImmunization" });
  const { fields: wpFields, append: appendWp, remove: removeWp } = useFieldArray({ control, name: "weaknessParalysis" });

  return (
    <div className="space-y-8">
      {/* SECTION 12 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">Section 12: Routine Immunization (&lt; 5 Years)</h3>
          <button type="button" onClick={() => appendRi({})} className="bg-indigo-600 text-white px-3 py-1 text-sm rounded hover:bg-indigo-700" disabled={riFields.length >= 5}>
            + Add RI Record ({riFields.length}/5)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-indigo-50">
            <tr>
              <th className="p-2 border">House No</th>
              <th className="p-2 border">Child Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Father Name</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Phone No</th>
              <th className="p-2 border">X</th>
            </tr>
          </thead>
          <tbody>
            {riFields.map((field, idx) => (
              <tr key={field.id}>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.houseNo`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.childName`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.age`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.fatherName`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.address`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`routineImmunization.${idx}.phoneNo`)} className="w-full px-1 border" /></td>
                <td className="p-2 border text-center"><button type="button" onClick={() => removeRi(idx)} className="text-red-500">&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 13 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">Section 13: Weakness / Paralysis Cases (&lt; 15 Years)</h3>
          <button type="button" onClick={() => appendWp({})} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700" disabled={wpFields.length >= 2}>
            + Add Case ({wpFields.length}/2)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-purple-50">
            <tr>
              <th className="p-2 border">House No</th>
              <th className="p-2 border">Child Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Father Name</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Diagnosis Date</th>
              <th className="p-2 border">X</th>
            </tr>
          </thead>
          <tbody>
            {wpFields.map((field, idx) => (
              <tr key={field.id}>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.houseNo`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.childName`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.age`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.fatherName`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.address`)} className="w-full px-1 border" /></td>
                <td className="p-2 border"><input type="date" {...register(`weaknessParalysis.${idx}.dateOfDiagnosis`)} className="w-full px-1 border" /></td>
                <td className="p-2 border text-center"><button type="button" onClick={() => removeWp(idx)} className="text-red-500">&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionMedicalCases;