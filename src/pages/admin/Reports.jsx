import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  Printer, 
  Calendar, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  RefreshCw,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [type, setType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const currency = "Rs.";

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vms_admin_token');
      let url = `${import.meta.env.VITE_API_URL || ''}/api/orders/reports/sales?type=${type}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to generate report');
      }
      const data = await res.json();
      setReportData(data);
      toast.success('Report generated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate report from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Aggregate total summaries from aggregated reportData
  const totalNetRevenue = reportData.reduce((sum, r) => sum + r.netSales, 0);
  const totalOrders = reportData.reduce((sum, r) => sum + r.ordersCount, 0);
  const totalItemsSold = reportData.reduce((sum, r) => sum + r.itemsCount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalNetRevenue / totalOrders) : 0;

  // Handle standard presets
  const applyPreset = (preset) => {
    const today = new Date();
    if (preset === '7days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'thisyear') {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Triggers native browser download of formatted CSV file
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error('No report data available to export');
      return;
    }
    const headers = ["Period", "Orders Placed", "Items Sold", "Avg Order Value (Rs.)", "Discounts (Rs.)", "Net Revenue (Rs.)"];
    const rows = reportData.map(d => [
      d.period,
      d.ordersCount,
      d.itemsCount,
      d.averageOrderValue,
      d.discounts,
      d.netSales
    ]);
    
    // Construct CSV text content
    const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations for custom dynamic responsive SVG chart
  const maxNetSales = Math.max(...reportData.map(d => d.netSales), 0);
  const chartHeight = 200;
  const chartWidth = 800;
  const paddingX = 60;
  const paddingY = 30;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  return (
    <div className="space-y-8 animate-fadeIn printable-area">
      {/* CSS overrides for print media */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .printable-area {
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide Sidebar, Top bar and filters on print */
          aside, nav, .non-printable, header, button, .filter-box {
            display: none !important;
          }
          .w-64, .h-16 {
            display: none !important;
          }
          .flex-1 {
            margin: 0 !important;
            padding: 0 !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header section (Non-printable controls) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-500" />
            Sales Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Generate daily and monthly revenue analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export CSV
          </button>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xl"
          >
            <Printer className="w-4 h-4 text-green-400" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Printable Report Title (Only visible in Print/PDF or top of table) */}
      <div className="hidden print:block text-center border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">VMS SUPER MART</h1>
        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase mt-1">Official Sales & Revenue Aggregation Report</p>
        <div className="grid grid-cols-3 gap-4 text-xs font-mono mt-4 max-w-md mx-auto text-slate-600">
          <div>Report Type: {type === 'daily' ? 'Daily Sales' : 'Monthly Sales'}</div>
          <div>From: {startDate || 'All Time'}</div>
          <div>To: {endDate || 'Today'}</div>
        </div>
      </div>

      {/* Filter toolbar Box (Non-printable) */}
      <div className="bg-white p-6 border border-slate-200/60 shadow-sm non-printable filter-box space-y-4">
        <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Report Filtering Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Type Select */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase">Report Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="daily">Daily Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Start Date
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              End Date
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Fetch Action & Presets */}
          <div className="flex gap-2">
            <button 
              onClick={fetchReport}
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-green-400" /> : <Search className="w-4 h-4 text-green-400" />}
              Generate
            </button>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Quick Select:</span>
          {['7days', '30days', 'thisyear', 'all'].map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[9px] transition-colors"
            >
              {preset === '7days' && 'Last 7 Days'}
              {preset === '30days' && 'Last 30 Days'}
              {preset === 'thisyear' && 'This Year'}
              {preset === 'all' && 'Reset Range'}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-none p-5 border border-slate-200/60 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Net Sales Revenue</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1.5">{currency}{totalNetRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-none p-5 border border-slate-200/60 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Total Orders</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1.5">{totalOrders}</h3>
        </div>
        <div className="bg-white rounded-none p-5 border border-slate-200/60 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Avg Order Value</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1.5">{currency}{averageOrderValue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-none p-5 border border-slate-200/60 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Items Sold</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1.5">{totalItemsSold}</h3>
        </div>
      </div>

      {/* Dynamic Vector Trend Chart (SVG) */}
      <div className="bg-white p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Sales Revenue Trend (Rs.)</h3>
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
            Live Database Data
          </span>
        </div>
        
        {reportData.length > 0 && maxNetSales > 0 ? (
          <div className="w-full overflow-x-auto">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto min-w-[600px] select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* SVG Defs for Gradients */}
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const yVal = paddingY + plotHeight * (1 - ratio);
                const gridLabel = Math.round(maxNetSales * ratio);
                return (
                  <g key={index}>
                    <line 
                      x1={paddingX} 
                      y1={yVal} 
                      x2={chartWidth - paddingX} 
                      y2={yVal} 
                      stroke="#F1F5F9" 
                      strokeWidth="1.5"
                    />
                    <text 
                      x={paddingX - 10} 
                      y={yVal + 4} 
                      fill="#94A3B8" 
                      fontSize="9" 
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {currency}{gridLabel >= 1000 ? `${(gridLabel / 1000).toFixed(1)}k` : gridLabel}
                    </text>
                  </g>
                );
              })}

              {/* Bar Elements */}
              {reportData.map((d, index) => {
                const count = reportData.length;
                const barSpacing = plotWidth / count;
                const barWidth = Math.max(8, barSpacing * 0.5);
                const xVal = paddingX + index * barSpacing + (barSpacing - barWidth) / 2;
                
                const rawBarHeight = maxNetSales > 0 ? (d.netSales / maxNetSales) * plotHeight : 0;
                const barHeight = Math.max(4, rawBarHeight); // Ensure minimum visible height
                const yVal = paddingY + plotHeight - barHeight;

                return (
                  <g key={d.period} className="group cursor-pointer">
                    <title>{`${d.period}: ${currency}${d.netSales.toLocaleString()} (${d.ordersCount} orders)`}</title>
                    {/* Active Bar Rectangle */}
                    <rect 
                      x={xVal} 
                      y={yVal} 
                      width={barWidth} 
                      height={barHeight} 
                      fill="url(#barGradient)"
                      rx="1"
                      className="transition-all hover:fill-indigo-500 duration-200"
                    />
                    {/* Micro-label on top of bar on hover */}
                    <text
                      x={xVal + barWidth / 2}
                      y={yVal - 6}
                      fill="#475569"
                      fontSize="8"
                      fontWeight="black"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {currency}{d.netSales}
                    </text>
                    {/* X-Axis Date label */}
                    {index % Math.ceil(count / 12) === 0 && (
                      <text 
                        x={xVal + barWidth / 2} 
                        y={chartHeight - paddingY + 16} 
                        fill="#94A3B8" 
                        fontSize="8" 
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {d.period.substring(d.period.indexOf('-') + 1)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bottom Base Line */}
              <line 
                x1={paddingX} 
                y1={chartHeight - paddingY} 
                x2={chartWidth - paddingX} 
                y2={chartHeight - paddingY} 
                stroke="#E2E8F0" 
                strokeWidth="2"
              />
            </svg>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            No sales records in selected period to map trends.
          </div>
        )}
      </div>

      {/* Aggregate Report Grid Table */}
      <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Tabular Sales Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4">Report Period</th>
                <th className="px-6 py-4">Orders Placed</th>
                <th className="px-6 py-4">Total Items Sold</th>
                <th className="px-6 py-4">Avg Order Value (AOV)</th>
                <th className="px-6 py-4">Total Discounts</th>
                <th className="px-6 py-4">Net Sales Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reportData.map(d => (
                <tr key={d.period} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 font-mono text-xs font-black text-slate-800 tracking-tight">{d.period}</td>
                  <td className="px-6 py-4.5 font-semibold text-slate-700">{d.ordersCount}</td>
                  <td className="px-6 py-4.5 font-semibold text-slate-700">{d.itemsCount}</td>
                  <td className="px-6 py-4.5 font-semibold text-slate-700">{currency}{d.averageOrderValue.toLocaleString()}</td>
                  <td className="px-6 py-4.5 text-red-500 font-bold">-{currency}{d.discounts.toLocaleString()}</td>
                  <td className="px-6 py-4.5 font-black text-slate-800">{currency}{d.netSales.toLocaleString()}</td>
                </tr>
              ))}

              {!loading && reportData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No matching report records</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting the filter dates or adding new store checkouts.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
