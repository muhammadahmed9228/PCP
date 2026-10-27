import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const TallySheetSummary = () => {
  const { control } = useFormContext();
  const { t } = useTranslation();
  
  const households = useWatch({ control, name: "households" }) || [];
  const schools = useWatch({ control, name: "schools" }) || [];
  const streetVacc = Number(useWatch({ control, name: "streetVaccinated" })) || 0;

  // Compute Live Totals
  let sumHouseChildren = 0, sumVacc0to1 = 0, sumVacc1to5 = 0, sumHouseVacc = 0, sumHouseUnvacc = 0;
  let sumGuestChildren = 0, sumGuestVacc = 0, sumGuestUnvacc = 0;
  let mmpTotal = 0, mmpVacc = 0;
  let zeroHouses = 0, lockHouses = 0;

  households.forEach(h => {
    if (h.classification === "L") { lockHouses++; return; }
    if (h.classification === "0/0") { zeroHouses++; return; }

    const cUnder5 = Number(h.childrenUnder5) || 0;
    const v01 = Number(h.vacc0to1) || 0;
    const v15 = Number(h.vacc1to5) || 0;
    const tVacc = v01 + v15;
    
    sumHouseChildren += cUnder5;
    sumVacc0to1 += v01;
    sumVacc1to5 += v15;
    sumHouseVacc += tVacc;
    sumHouseUnvacc += Math.max(0, cUnder5 - tVacc);

    const gUnder5 = Number(h.guestUnder5) || 0;
    const gVacc = Number(h.guestVacc) || 0;
    sumGuestChildren += gUnder5;
    sumGuestVacc += gVacc;
    sumGuestUnvacc += Math.max(0, gUnder5 - gVacc);

    if (h.classification === "MMP") {
      mmpTotal += cUnder5;
      mmpVacc += tVacc;
    }
  });

  const sumSchoolVacc = schools.reduce((acc, curr) => acc + (Number(curr.vaccinated) || 0), 0);
  const grandTotal = sumHouseVacc + sumSchoolVacc + streetVacc + sumGuestVacc;

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Live coverage</p><h3 className="text-base font-bold text-slate-900 sm:text-lg">{t("liveSummary")}</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Auto-calculated</span></div>
      <div className="grid grid-cols-2 gap-2.5 text-sm sm:gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-blue-50 p-3 sm:p-4">
          <p className="text-gray-500 font-medium">{t("houseVaccinated")}</p>
          <p className="text-2xl font-bold text-blue-700">{sumHouseVacc}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 sm:p-4">
          <p className="text-gray-500 font-medium">{t("schoolVaccinated")}</p>
          <p className="text-2xl font-bold text-indigo-700">{sumSchoolVacc}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 sm:p-4">
          <p className="text-gray-500 font-medium">{t("streetGuestVacc")}</p>
          <p className="text-2xl font-bold text-teal-700">{streetVacc + sumGuestVacc}</p>
        </div>
        <div className="rounded-xl border border-green-300 bg-green-100 p-3 sm:p-4">
          <p className="text-green-800 font-bold">{t("grandTotalVacc")}</p>
          <p className="text-3xl font-black text-green-700">{grandTotal}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-6">
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("unvaccHouses")}</span><strong className="text-lg text-red-600">{sumHouseUnvacc}</strong></div>
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("unvaccGuests")}</span><strong className="text-lg text-orange-600">{sumGuestUnvacc}</strong></div>
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("mmpChildren")}</span><strong className="text-lg">{mmpTotal}</strong></div>
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("mmpVacc")}</span><strong className="text-lg">{mmpVacc}</strong></div>
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("lockHouses")}</span><strong className="text-lg">{lockHouses}</strong></div>
        <div className="rounded-xl border border-slate-200 p-2.5"><span className="block text-slate-500">{t("zeroHouses")}</span><strong className="text-lg">{zeroHouses}</strong></div>
      </div>
    </div>
  );
};

export default TallySheetSummary;
