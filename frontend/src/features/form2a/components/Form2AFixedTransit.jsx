import React from "react";

const THEMES = {
  indigo: {
    title: "text-indigo-900",
    header: "bg-indigo-50 text-indigo-900",
    footer: "bg-indigo-600 text-white",
    footerBg: "#4f46e5"
  },
  teal: {
    title: "text-teal-900",
    header: "bg-teal-50 text-teal-900",
    footer: "bg-teal-700 text-white",
    footerBg: "#0f766e"
  }
};

const TeamTable = ({ title, perfs, totals, bgColor = "indigo" }) => {
  if (!perfs || perfs.length === 0) {
    return <div className="p-4 text-gray-500 italic border rounded">No {title} Teams reported.</div>;
  }

  const theme = THEMES[bgColor] || THEMES.indigo;

  // Calculate total vaccinated fallback from perfs if totals object doesn't have it
  const totalVaccinated = totals?.vaccinatedChildren != null
    ? totals.vaccinatedChildren
    : perfs.reduce((sum, p) => sum + (Number(p.vaccinatedChildren) || 0), 0);

  return (
    <div className="mb-8">
      <h3 className={`text-lg font-bold mb-3 ${theme.title}`}>{title} Teams Daily Performance</h3>
      <div className="overflow-x-auto border rounded-sm">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead className={theme.header}>
            <tr>
              <th className="border p-2">Team No</th>
              <th className="border p-2">Members</th>
              <th className="border p-2 bg-green-50">Total Vaccinated</th>
              <th className="border p-2">AFP Notified</th>
              <th className="border p-2">Zero Dose RI</th>
              <th className="border p-2">Vaccines Used</th>
              <th className="border p-2">Markers Used</th>
            </tr>
          </thead>
          <tbody>
            {perfs.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2 font-bold">{p.teamNo}</td>
                <td className="border p-2 text-left">
                  <div>{p.leaderName}</div>
                  <div className="text-gray-500 text-xs">{p.memberName}</div>
                </td>
                <td className="border p-2 bg-green-50 font-bold">{p.vaccinatedChildren}</td>
                <td className="border p-2">{p.afpCases}</td>
                <td className="border p-2">{p.zeroDoseRI}</td>
                <td className="border p-2">{p.vaccines?.used || 0}</td>
                <td className="border p-2">{p.markers?.used || 0}</td>
              </tr>
            ))}
          </tbody>
          <tfoot 
            className={`${theme.footer} font-bold`}
            style={{ backgroundColor: theme.footerBg, color: "#ffffff" }}
          >
            <tr>
              <td className="border p-2" colSpan="2">TOTALS ({title})</td>
              <td className="border p-2">{totalVaccinated}</td>
              <td className="border p-2" colSpan="4">Rest aggregated in Inventory Tab</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const Form2AFixedTransit = ({ data }) => {
  return (
    <div className="space-y-6">
      <TeamTable 
        title="Section 6: Fixed" 
        perfs={data.fixedPerformances} 
        totals={data.aggregatedFixedTotals} 
        bgColor="indigo" 
      />
      
      <TeamTable 
        title="Section 7: Transit" 
        perfs={data.transitPerformances} 
        totals={data.aggregatedTransitTotals} 
        bgColor="teal" 
      />
    </div>
  );
};

export default Form2AFixedTransit;