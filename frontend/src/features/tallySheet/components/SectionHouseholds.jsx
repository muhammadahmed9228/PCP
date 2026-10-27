import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SectionHouseholds = () => {
  const { register, control } = useFormContext();
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "households"
  });

  const householdsWatch = useWatch({ control, name: "households" }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
        <div><label className="text-sm font-medium">{t("headFirstHouse")}</label><input {...register("headOfFirstHouse")} className="mt-1 w-full px-2 py-1 border rounded" /></div>
        <div><label className="text-sm font-medium">{t("headLastHouse")}</label><input {...register("headOfLastHouse")} className="mt-1 w-full px-2 py-1 border rounded" /></div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">{t("section6Households")}</h3>
          <button type="button" onClick={() => append({ houseNo: "", classification: "Normal" })} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700" disabled={fields.length >= 119}>
            + {t("addHouse")} ({fields.length}/119)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">{t("sr")}</th>
                <th className="p-2 border">{t("houseNo")}</th>
                <th className="p-2 border">{t("class")}</th>
                <th className="p-2 border" colSpan="3">{t("houseChildren")}</th>
                <th className="p-2 border bg-blue-50">{t("unvaccAuto")}</th>
                <th className="p-2 border" colSpan="2">{t("guestsVacc")}</th>
                <th className="p-2 border bg-blue-50">{t("guestUnvaccAuto")}</th>
                <th className="p-2 border">X</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const current = householdsWatch[index] || {};
                const isLocked = current.classification === "L" || current.classification === "0/0";
                
                // Live UI Calculation Previews (Backend is Authoritative)
                const totalVacc = (Number(current.vacc0to1) || 0) + (Number(current.vacc1to5) || 0);
                const unvacc = Math.max(0, (Number(current.childrenUnder5) || 0) - totalVacc);
                const guestUnvacc = Math.max(0, (Number(current.guestUnder5) || 0) - (Number(current.guestVacc) || 0));

                return (
                  <tr key={field.id} className="text-center">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border"><input {...register(`households.${index}.houseNo`)} className="w-16 px-1 border" required /></td>
                    <td className="p-2 border">
                      <select {...register(`households.${index}.classification`)} className="px-1 border bg-white">
                        <option value="Normal">{t("normal")}</option><option value="MMP">MMP</option>
                        <option value="L">L</option><option value="0/0">0/0</option>
                      </select>
                    </td>
                    <td className="p-2 border"><input type="number" {...register(`households.${index}.childrenUnder5`)} disabled={isLocked} className="w-12 px-1 border disabled:bg-gray-200" title={t("childrenUnder5")} /></td>
                    <td className="p-2 border"><input type="number" {...register(`households.${index}.vacc0to1`)} disabled={isLocked} className="w-12 px-1 border disabled:bg-gray-200" title={t("vaccinated01")} /></td>
                    <td className="p-2 border"><input type="number" {...register(`households.${index}.vacc1to5`)} disabled={isLocked} className="w-12 px-1 border disabled:bg-gray-200" title={t("vaccinated15")} /></td>
                    <td className="p-2 border bg-blue-50 font-bold text-red-600">{unvacc}</td>
                    
                    <td className="p-2 border"><input type="number" {...register(`households.${index}.guestUnder5`)} disabled={isLocked} className="w-12 px-1 border disabled:bg-gray-200" title={t("guestsUnder5")} /></td>
                    <td className="p-2 border"><input type="number" {...register(`households.${index}.guestVacc`)} disabled={isLocked} className="w-12 px-1 border disabled:bg-gray-200" title={t("vaccinatedGuests")} /></td>
                    <td className="p-2 border bg-blue-50 font-bold text-red-600">{guestUnvacc}</td>
                    
                    <td className="p-2 border"><button type="button" onClick={() => remove(index)} className="text-red-500 font-bold">&times;</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SectionHouseholds;
