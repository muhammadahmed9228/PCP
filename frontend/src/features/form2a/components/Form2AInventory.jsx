import React from "react";

const Form2AInventory = ({ data }) => {
  const { collectiveInventory: inv } = data;
  if (!inv) return null;

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-800">Section 8: Daily Collective Inventory</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* VACCINES MASTER TABLE */}
        <div className="border rounded shadow-sm">
          <div className="bg-yellow-50 p-3 border-b font-bold text-yellow-900">Vaccine Doses Record (Collective)</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Team Type</th>
                <th className="p-2 border">Received</th>
                <th className="p-2 border">Used</th>
                <th className="p-2 border">Returned</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 border font-medium text-left">Mobile Teams</td>
                <td className="p-2 border">{inv.vaccines.mobile.received}</td>
                <td className="p-2 border">{inv.vaccines.mobile.used}</td>
                <td className="p-2 border">{inv.vaccines.mobile.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">Fixed Teams</td>
                <td className="p-2 border">{inv.vaccines.fixed.received}</td>
                <td className="p-2 border">{inv.vaccines.fixed.used}</td>
                <td className="p-2 border">{inv.vaccines.fixed.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">Transit Teams</td>
                <td className="p-2 border">{inv.vaccines.transit.received}</td>
                <td className="p-2 border">{inv.vaccines.transit.used}</td>
                <td className="p-2 border">{inv.vaccines.transit.returned}</td>
              </tr>
            </tbody>
            <tfoot className="bg-yellow-600 text-white font-bold">
              <tr>
                <td className="p-2 border text-left">DAILY TOTAL</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.received}</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.used}</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.returned}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MARKERS MASTER TABLE */}
        <div className="border rounded shadow-sm">
          <div className="bg-gray-100 p-3 border-b font-bold text-gray-800">Finger Markers Record (Collective)</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Team Type</th>
                <th className="p-2 border">Received</th>
                <th className="p-2 border">Used</th>
                <th className="p-2 border">Returned</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 border font-medium text-left">Mobile Teams</td>
                <td className="p-2 border">{inv.markers.mobile.received}</td>
                <td className="p-2 border">{inv.markers.mobile.used}</td>
                <td className="p-2 border">{inv.markers.mobile.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">Fixed Teams</td>
                <td className="p-2 border">{inv.markers.fixed.received}</td>
                <td className="p-2 border">{inv.markers.fixed.used}</td>
                <td className="p-2 border">{inv.markers.fixed.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">Transit Teams</td>
                <td className="p-2 border">{inv.markers.transit.received}</td>
                <td className="p-2 border">{inv.markers.transit.used}</td>
                <td className="p-2 border">{inv.markers.transit.returned}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-700 text-white font-bold">
              <tr>
                <td className="p-2 border text-left">DAILY TOTAL</td>
                <td className="p-2 border">{inv.markers.dailyTotal.received}</td>
                <td className="p-2 border">{inv.markers.dailyTotal.used}</td>
                <td className="p-2 border">{inv.markers.dailyTotal.returned}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Form2AInventory;