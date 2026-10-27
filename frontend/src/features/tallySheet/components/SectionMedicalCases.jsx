import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SectionMedicalCases = () => {
  const { register, control } = useFormContext();
  const { t } = useTranslation();
  
  const { fields: riFields, append: appendRi, remove: removeRi } = useFieldArray({ control, name: "routineImmunization" });
  const { fields: wpFields, append: appendWp, remove: removeWp } = useFieldArray({ control, name: "weaknessParalysis" });

  return (
    <div className="space-y-8">
      {/* SECTION 12 */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">{t("section12Routine")}</h3>
          <button type="button" onClick={() => appendRi({})} className="bg-indigo-600 text-white px-3 py-1 text-sm rounded hover:bg-indigo-700" disabled={riFields.length >= 5}>
            + {t("addRiRecord")} ({riFields.length}/5)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-indigo-50">
            <tr>
              <th className="p-2 border">{t("houseNo")}</th>
              <th className="p-2 border">{t("childName")}</th>
              <th className="p-2 border">{t("age")}</th>
              <th className="p-2 border">{t("fatherName")}</th>
              <th className="p-2 border">{t("address")}</th>
              <th className="p-2 border">{t("phoneNo")}</th>
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
          <h3 className="text-lg font-semibold">{t("section13Paralysis")}</h3>
          <button type="button" onClick={() => appendWp({})} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700" disabled={wpFields.length >= 2}>
            + {t("addCase")} ({wpFields.length}/2)
          </button>
        </div>
        <table className="min-w-full text-sm border">
          <thead className="bg-purple-50">
            <tr>
              <th className="p-2 border">{t("houseNo")}</th>
              <th className="p-2 border">{t("childName")}</th>
              <th className="p-2 border">{t("age")}</th>
              <th className="p-2 border">{t("fatherName")}</th>
              <th className="p-2 border">{t("address")}</th>
              <th className="p-2 border">{t("diagnosisDate")}</th>
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
