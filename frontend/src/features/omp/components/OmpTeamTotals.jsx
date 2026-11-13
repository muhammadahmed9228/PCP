import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const fields = [
  ['totalHouseholds','totalHouseholds'], ['totalUnder1Year','under1Household'], ['total1to5Years','oneToFiveHousehold'],
  ['totalSchoolMadrasa','schoolMadrasaChildren'], ['grandTotalChildren','grandTotal'], ['totalVaccineDoses','totalVaccineDosesAvailable'],
  ['totalUnvaccinatedPast','unvaccinatedPastCampaign'], ['totalMigrantMobile','migrantMobileChildren'], ['vitaminARed','redCapsules'],
  ['vitaminABlue','blueCapsules'], ['marker','marker'], ['chalk','chalk'], ['dropper','dropper'], ['plasticBags','plasticBags']
];

export default function OmpTeamTotals({ teamId, campaignId, refreshKey }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!teamId || !campaignId) return;
    const controller = new AbortController();
    setData(null); setError(''); setLoading(true);
    api.get(`/omp/team/${encodeURIComponent(teamId)}/totals`, { params: { campaignId }, signal: controller.signal })
      .then(response => setData(response.data.data))
      .catch(e => { if (e.code !== 'ERR_CANCELED') setError(t('ompTotalsLoadFailed')); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [teamId, campaignId, refreshKey, t]);
  if (!teamId) return null;
  return <details className="rounded-lg border bg-white p-4 shadow-sm">
    <summary className="cursor-pointer text-lg font-semibold">{t('ompTeamTotals')}</summary>
    <p className="mt-1 text-sm text-gray-600">{t('ompTotalsDescription')}</p>
    {!campaignId && <p role="alert" className="mt-3 text-red-700">{t('ompTotalsNoCampaign')}</p>}
    {loading && <p role="status" className="mt-3">{t('ompTotalsLoading')}</p>}
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    {data && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[34rem] border-collapse text-sm">
      <thead><tr><th scope="col" className="border p-2 text-start">{t('ompTotalsField')}</th>{data.days.map(day => <th scope="col" key={day.day} className="border p-2">{t('geoDay', {day:day.day})}<span className="block font-normal text-gray-600">{day.status ? t(`ampStatus${day.status}`, {defaultValue:day.status}) : t('ompDayNotSaved')}</span></th>)}<th scope="col" className="border p-2">{t('ompAllDaysTotal')}</th></tr></thead>
      <tbody>{fields.map(([key,label]) => <tr key={key}><th scope="row" className="border p-2 text-start font-medium">{t(label)}</th>{data.days.map(day => <td key={day.day} className="border p-2 text-center">{day.values[key] ?? '—'}</td>)}<td className="border p-2 text-center font-semibold">{data.totals[key] ?? '—'}</td></tr>)}</tbody>
    </table></div>}
  </details>;
}
