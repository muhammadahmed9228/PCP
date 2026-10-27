import { useMemo } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SectionLinkedUnvaccinated = () => {
  const { control, register } = useFormContext();
  const { t } = useTranslation();
  
  const households = useWatch({ control, name: "households" }) || [];

  // Generate dynamic dropdown options based on Section 6 math
  const validUnvaccHouses = useMemo(() => {
    return households.filter(h => {
      const totalVacc = (Number(h.vacc0to1) || 0) + (Number(h.vacc1to5) || 0);
      return (Number(h.childrenUnder5) || 0) - totalVacc > 0;
    });
  }, [households]);

  const validGuestUnvaccHouses = useMemo(() => {
    return households.filter(h => {
      return (Number(h.guestUnder5) || 0) - (Number(h.guestVacc) || 0) > 0;
    });
  }, [households]);

  const { fields: unvaccFields, append: appendUnvacc, remove: removeUnvacc } = useFieldArray({ control, name: "unvaccinatedChildren" });
  const { fields: guestFields, append: appendGuest, remove: removeGuest } = useFieldArray({ control, name: "refusedAbsentGuests" });

  return (
    <div className="space-y-8">
      {/* SECTION 10: Unvaccinated Children */}
      {validUnvaccHouses.length === 0 ? (
        <div className="bg-gray-50 p-4 text-gray-500 rounded border">
          {t("noUnvaccinatedHouseChildren")}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-semibold text-red-700">
              {t("section10Unvaccinated")}
            </h3>
            <button
              type="button"
              onClick={() =>
                appendUnvacc({
                  houseNo: "",
                  childName: "",
                  ageGroup: "Under 1",
                  age: "",
                  fatherName: "",
                  reason: "Not Available",
                  coveredSameDay: false
                })
              }
              className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
            >
              + {t("addChildRecord")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-red-50">
                <tr>
                  <th className="p-2 border">{t("houseNo")}</th>
                  <th className="p-2 border">{t("childName")}</th>
                  <th className="p-2 border">{t("ageGroup")}</th>
                  <th className="p-2 border">{t("exactAge")}</th>
                  <th className="p-2 border">{t("fatherName")}</th>
                  <th className="p-2 border">{t("reason")}</th>
                  <th className="p-2 border bg-green-50 text-green-900">{t("coveredSameDay")}</th>
                  <th className="p-2 border">{t("returnDate")}</th>
                  <th className="p-2 border">{t("nextVaccDate")}</th>
                  <th className="p-2 border">X</th>
                </tr>
              </thead>
              <tbody>
                {unvaccFields.map((field, idx) => (
                  <tr key={field.id} className="text-center">
                    <td className="p-2 border">
                      <select
                        {...register(`unvaccinatedChildren.${idx}.houseNo`)}
                        className="w-full px-1 py-1 border bg-white"
                        required
                      >
                        <option value="">{t("selectHouse")}</option>
                        {validUnvaccHouses.map((h) => (
                          <option key={h.houseNo} value={h.houseNo}>
                            {t("house")} {h.houseNo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">
                      <input
                        {...register(`unvaccinatedChildren.${idx}.childName`)}
                        className="w-full px-1 py-1 border"
                        required
                      />
                    </td>
                    <td className="p-2 border">
                      <select
                        {...register(`unvaccinatedChildren.${idx}.ageGroup`)}
                        className="w-full px-1 py-1 border bg-white"
                        required
                      >
                        <option value="Under 1">&lt; 1 Year</option>
                        <option value="1 to 5">1–5 Years</option>
                      </select>
                    </td>
                    <td className="p-2 border">
                      <input
                        placeholder={t("ageExample")}
                        {...register(`unvaccinatedChildren.${idx}.age`)}
                        className="w-20 px-1 py-1 border"
                        required
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        {...register(`unvaccinatedChildren.${idx}.fatherName`)}
                        className="w-full px-1 py-1 border"
                        required
                      />
                    </td>
                    <td className="p-2 border">
                      <select
                        {...register(`unvaccinatedChildren.${idx}.reason`)}
                        className="w-full px-1 py-1 border bg-white"
                        required
                      >
                        <option value="Not Available">Not Available</option>
                        <option value="Refusal">Refusal</option>
                      </select>
                    </td>
                    <td className="p-2 border bg-green-50/50">
                      <input
                        type="checkbox"
                        {...register(`unvaccinatedChildren.${idx}.coveredSameDay`)}
                        className="w-4 h-4 accent-green-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        {...register(`unvaccinatedChildren.${idx}.dateOfReturn`)}
                        className="w-full px-1 py-1 border"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        {...register(`unvaccinatedChildren.${idx}.nextVaccinationDate`)}
                        className="w-full px-1 py-1 border"
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        type="button"
                        onClick={() => removeUnvacc(idx)}
                        className="text-red-500 font-bold"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 11: Refused/Absent Guests */}
      {validGuestUnvaccHouses.length === 0 ? (
        <div className="bg-gray-50 p-4 text-gray-500 rounded border">{t("noUnvaccinatedGuests")}</div>
      ) : (
        <div>
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-semibold text-orange-700">{t("section11Guests")}</h3>
            <button
              type="button"
              onClick={() =>
                appendGuest({
                  houseNo: "",
                  childName: "",
                  age: "",
                  fatherName: "",
                  reason: ""
                })
              }
              className="bg-orange-600 text-white px-3 py-1 text-sm rounded hover:bg-orange-700"
            >
              + {t("addGuestRecord")}
            </button>
          </div>
          <table className="min-w-full text-sm border">
            <thead className="bg-orange-50">
              <tr>
                <th className="p-2 border">{t("houseDropdown")}</th>
                <th className="p-2 border">{t("childName")}</th>
                <th className="p-2 border">{t("age")}</th>
                <th className="p-2 border">{t("fatherName")}</th>
                <th className="p-2 border">{t("reason")}</th>
                <th className="p-2 border">X</th>
              </tr>
            </thead>
            <tbody>
              {guestFields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="p-2 border">
                    <select {...register(`refusedAbsentGuests.${idx}.houseNo`)} className="w-full px-1 py-1 border bg-white" required>
                      <option value="">Select House...</option>
                      {validGuestUnvaccHouses.map(h => <option key={h.houseNo} value={h.houseNo}>House {h.houseNo}</option>)}
                    </select>
                  </td>
                  <td className="p-2 border"><input {...register(`refusedAbsentGuests.${idx}.childName`)} className="w-full px-1 py-1 border" required /></td>
                  <td className="p-2 border">
                    <input
                      placeholder="e.g. 6m / 3y"
                      {...register(`refusedAbsentGuests.${idx}.age`)}
                      className="w-20 px-1 py-1 border"
                      required
                    />
                  </td>
                  <td className="p-2 border"><input {...register(`refusedAbsentGuests.${idx}.fatherName`)} className="w-full px-1 py-1 border" required /></td>
                  <td className="p-2 border">
                    <select {...register(`refusedAbsentGuests.${idx}.reason`)} className="w-full px-1 py-1 border bg-white" required>
                      <option value="">Select...</option>
                      <option value="Refused">Refused</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>
                  <td className="p-2 border text-center"><button type="button" onClick={() => removeGuest(idx)} className="text-red-500 font-bold">&times;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SectionLinkedUnvaccinated;
