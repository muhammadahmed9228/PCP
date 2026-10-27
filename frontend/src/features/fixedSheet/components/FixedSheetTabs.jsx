import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

// --- TAB 1: VACCINATION ---
export const TabVaccinated = () => {
  const { register, control } = useFormContext();
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: "vaccinatedChildren" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold">{t("fixedSection5")}</h3>
        <button type="button" onClick={() => append({})} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50" disabled={fields.length >= 60}>
          + {t("addVaccinatedChild")} ({fields.length}/60)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-2 border">{t("sr")}</th>
              <th className="p-2 border">{t("childName")}</th>
              <th className="p-2 border">{t("age")}</th>
              <th className="p-2 border">{t("fatherName")}</th>
              <th className="p-2 border">{t("address")}</th>
              <th className="p-2 border">X</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="text-center">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border"><input {...register(`vaccinatedChildren.${index}.childName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`vaccinatedChildren.${index}.age`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`vaccinatedChildren.${index}.fatherName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`vaccinatedChildren.${index}.address`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><button type="button" onClick={() => remove(index)} className="text-red-500 font-bold">&times;</button></td>
              </tr>
            ))}
            {fields.length === 0 && <tr><td colSpan="6" className="p-4 text-gray-500">{t("noChildrenVaccinated")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- TAB 2: MEDICAL & AFP ---
export const TabMedical = () => {
  const { register, control } = useFormContext();
  const { t } = useTranslation();
  const { fields: unvaccFields, append: appendUnvacc, remove: removeUnvacc } = useFieldArray({ control, name: "unvaccinatedChildren" });
  const { fields: wpFields, append: appendWp, remove: removeWp } = useFieldArray({ control, name: "weaknessParalysis" });

  return (
    <div className="space-y-8">
      {/* SECTION 6 */}
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="font-semibold mb-2">{t("fixedSection6")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm">{t("afpCases")}</label><input type="number" {...register("afpCasesNoticed")} className="mt-1 w-full px-3 py-2 border rounded" /></div>
          <div><label className="block text-sm">{t("zeroDoseRi")}</label><input type="number" {...register("zeroDoseRIRecorded")} className="mt-1 w-full px-3 py-2 border rounded" /></div>
        </div>
      </div>

      {/* SECTION 7 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-red-700">{t("fixedSection7")}</h3>
          <button type="button" onClick={() => appendUnvacc({})} className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700" disabled={unvaccFields.length >= 5}>
            + {t("addUnvaccinated")} ({unvaccFields.length}/5)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-red-50">
            <tr>
              <th className="p-2 border">{t("childName")}</th>
              <th className="p-2 border">{t("fatherName")}</th>
              <th className="p-2 border">{t("age")}</th>
              <th className="p-2 border">{t("address")}</th>
              <th className="p-2 border">{t("phoneNo")}</th>
              <th className="p-2 border">X</th>
            </tr>
          </thead>
          <tbody>
            {unvaccFields.map((field, idx) => (
              <tr key={field.id}>
                <td className="p-2 border"><input {...register(`unvaccinatedChildren.${idx}.childName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`unvaccinatedChildren.${idx}.fatherName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`unvaccinatedChildren.${idx}.age`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`unvaccinatedChildren.${idx}.address`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`unvaccinatedChildren.${idx}.phoneNo`)} className="w-full px-1 border" /></td>
                <td className="p-2 border text-center"><button type="button" onClick={() => removeUnvacc(idx)} className="text-red-500">&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 8 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-purple-700">{t("fixedSection8")}</h3>
          <button type="button" onClick={() => appendWp({})} className="bg-purple-600 text-white px-3 py-1 text-sm rounded" disabled={wpFields.length >= 5}>
            + {t("addCase")} ({wpFields.length}/5)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-purple-50">
            <tr>
              <th className="p-2 border">{t("childName")}</th>
              <th className="p-2 border">{t("fatherName")}</th>
              <th className="p-2 border">{t("age")}</th>
              <th className="p-2 border">{t("dateDiagnosed")}</th>
              <th className="p-2 border">{t("address")}</th>
              <th className="p-2 border">{t("phoneNo")}</th>
              <th className="p-2 border">X</th>
            </tr>
          </thead>
          <tbody>
            {wpFields.map((field, idx) => (
              <tr key={field.id}>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.childName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.fatherName`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.age`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input type="date" {...register(`weaknessParalysis.${idx}.dateDiagnosed`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.address`)} className="w-full px-1 border" required /></td>
                <td className="p-2 border"><input {...register(`weaknessParalysis.${idx}.phoneNo`)} className="w-full px-1 border" /></td>
                <td className="p-2 border text-center"><button type="button" onClick={() => removeWp(idx)} className="text-red-500">&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
