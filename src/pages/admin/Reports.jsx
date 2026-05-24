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
  const [hoveredIndex, setHoveredIndex] = useState(null);
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

    // Professional Business Metadata Header Block
    const docTitle = "VMS SUPER MART - OFFICIAL SALES & REVENUE REPORT";
    const reportType = `Report Type: ${type === 'daily' ? 'Daily Sales Summary' : 'Monthly Sales Summary'}`;
    const dateRange = `Date Range: ${startDate || 'All Time'} to ${endDate || 'Today'}`;
    const generatedAt = `Generated At: ${new Date().toLocaleString()}`;
    const gap = "";

    // Aggregates for the Total Summary row at the bottom
    const totalRevenue = reportData.reduce((sum, r) => sum + r.netSales, 0);
    const totalOrdersCount = reportData.reduce((sum, r) => sum + r.ordersCount, 0);
    const totalItemsCount = reportData.reduce((sum, r) => sum + r.itemsCount, 0);
    const totalDiscountsCount = reportData.reduce((sum, r) => sum + r.discounts, 0);
    const totalGrossRevenue = reportData.reduce((sum, r) => sum + r.grossSales, 0);
    const overallAOV = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Headers with detailed columns
    const headers = [
      "Period", 
      "Orders Placed", 
      "Items Sold", 
      "Average Order Value (Rs.)", 
      "Total Discounts (Rs.)", 
      "Gross Sales (Rs.)", 
      "Net Sales Revenue (Rs.)"
    ];

    // Data rows
    const rows = reportData.map(d => [
      d.period,
      d.ordersCount,
      d.itemsCount,
      d.averageOrderValue,
      d.discounts,
      d.grossSales,
      d.netSales
    ]);

    // Totals / Averages row
    const totalsRow = [
      "TOTALS / OVERALL",
      totalOrdersCount,
      totalItemsCount,
      overallAOV,
      totalDiscountsCount,
      totalGrossRevenue,
      totalRevenue
    ];

    // Build standard CSV grid text content (enclosing strings in quotes to handle any special commas)
    const csvContentRows = [
      `"${docTitle}"`,
      `"${reportType}"`,
      `"${dateRange}"`,
      `"${generatedAt}"`,
      gap, // Empty separator row
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => typeof cell === 'string' ? `"${cell}"` : cell).join(',')),
      gap, // Empty separator before summary totals
      totalsRow.map(cell => typeof cell === 'string' ? `"${cell}"` : cell).join(',')
    ];

    const csvContentString = csvContentRows.join('\n');
    
    // Create UTF-8 CSV blob to correctly support symbols and formatting
    const blob = new Blob([csvContentString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VMS_Sales_Report_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Professional CSV exported successfully!');
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

  // Spline points for primary glowing trend line
  const linePoints = reportData.map((d, index) => {
    const count = reportData.length;
    const barSpacing = plotWidth / count;
    const barWidth = Math.max(8, barSpacing * 0.5);
    const xVal = paddingX + index * barSpacing + (barSpacing - barWidth) / 2;
    const centerX = xVal + barWidth / 2;
    const rawBarHeight = maxNetSales > 0 ? (d.netSales / maxNetSales) * plotHeight : 0;
    const barHeight = Math.max(4, rawBarHeight);
    const centerY = paddingY + plotHeight - barHeight;
    return { x: centerX, y: centerY };
  });

  const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const splinePath = getBezierPath(linePoints);
  const areaPath = linePoints.length > 0
    ? `${splinePath} L ${linePoints[linePoints.length - 1].x} ${chartHeight - paddingY} L ${linePoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Calculate target milestone dynamically based on total net revenue
  const getTargetMilestone = (revenue) => {
    if (revenue <= 0) return 20000;
    if (revenue < 5000) return 5000;
    if (revenue < 10000) return 10000;
    if (revenue < 25000) return 25000;
    if (revenue < 50000) return 50000;
    if (revenue < 100000) return 100000;
    if (revenue < 250000) return 250000;
    return Math.ceil(revenue / 100000) * 100000;
  };

  const targetMilestone = getTargetMilestone(totalNetRevenue);
  const targetPercent = Math.min(100, Math.round((totalNetRevenue / targetMilestone) * 100));

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
          /* Clean print overrides for dark premium visual boxes */
          .dark-chart-box {
            background: white !important;
            color: black !important;
            border: 1px solid #E2E8F0 !important;
            box-shadow: none !important;
          }
          .dark-chart-box text {
            fill: #334155 !important;
          }
          .dark-chart-box line {
            stroke: #E2E8F0 !important;
          }
          .dark-chart-box circle {
            stroke: #E2E8F0 !important;
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

      {/* Premium Unique & Modern Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Primary Chart: Cyberpunk Neon Trend Spline & Bar Hybrid Dashboard (2/3 width) */}
        <div className="lg:col-span-2 bg-slate-950 text-white p-6 border border-slate-900 shadow-2xl relative flex flex-col dark-chart-box overflow-hidden group">
          {/* Subtle Cyberpunk Neon Top Trim */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Revenue & Volume Analytics</h3>
              <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5 font-mono">Dynamic Spline-Bar Cockpit</p>
            </div>
            <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-800/50 font-mono">
              Live DB Sync
            </span>
          </div>

          {reportData.length > 0 && maxNetSales > 0 ? (
            <div className="w-full relative">
              {/* Responsive SVG */}
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto min-w-[500px] select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Defs block for stunning gradients & filter glows */}
                <defs>
                  {/* Cyber Bar Gradient */}
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                  </linearGradient>
                  
                  {/* Neon Spline Gradient */}
                  <linearGradient id="splineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>

                  {/* Area Fill Gradient under Spline */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>

                  {/* Spline Filter Shadow for Glow Effect */}
                  <filter id="splineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.6" />
                  </filter>

                  {/* Bar Glow Filter */}
                  <filter id="barGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#06B6D4" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Laser Dashed Grid Guides */}
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
                        stroke="#334155" 
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.2"
                      />
                      <text 
                        x={paddingX - 12} 
                        y={yVal + 3} 
                        fill="#64748B" 
                        fontSize="8" 
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {currency}{gridLabel >= 1000 ? `${(gridLabel / 1000).toFixed(0)}k` : gridLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Cyber Glassmorphic Bars */}
                {reportData.map((d, index) => {
                  const count = reportData.length;
                  const barSpacing = plotWidth / count;
                  const barWidth = Math.max(12, barSpacing * 0.45);
                  const xVal = paddingX + index * barSpacing + (barSpacing - barWidth) / 2;
                  
                  const rawBarHeight = maxNetSales > 0 ? (d.netSales / maxNetSales) * plotHeight : 0;
                  const barHeight = Math.max(6, rawBarHeight);
                  const yVal = paddingY + plotHeight - barHeight;

                  const isHovered = hoveredIndex === index;

                  return (
                    <g 
                      key={d.period} 
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Interactive Hover Backdrop Guide Column */}
                      <rect
                        x={xVal - barSpacing * 0.25}
                        y={paddingY}
                        width={barWidth + barSpacing * 0.5}
                        height={plotHeight}
                        fill="white"
                        fillOpacity={isHovered ? 0.03 : 0}
                        className="transition-all duration-150"
                      />

                      {/* Glowing Bar */}
                      <rect 
                        x={xVal} 
                        y={yVal} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="url(#barGrad)"
                        stroke={isHovered ? "#22D3EE" : "#0D9488"}
                        strokeWidth={isHovered ? 1.5 : 1}
                        rx="2"
                        className="transition-all duration-200"
                        style={{ filter: 'url(#barGlow)' }}
                      />

                      {/* Animated Laser Vertical Guide when hovered */}
                      {isHovered && (
                        <line
                          x1={xVal + barWidth / 2}
                          y1={paddingY}
                          x2={xVal + barWidth / 2}
                          y2={chartHeight - paddingY}
                          stroke="#22D3EE"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="animate-pulse"
                        />
                      )}

                      {/* X-Axis Label */}
                      {index % Math.ceil(count / 12) === 0 && (
                        <text 
                          x={xVal + barWidth / 2} 
                          y={chartHeight - paddingY + 16} 
                          fill={isHovered ? "#22D3EE" : "#64748B"} 
                          fontSize="8" 
                          fontWeight="black"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {d.period.substring(d.period.indexOf('-') + 1)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Shaded Area under spline path */}
                {areaPath && (
                  <path 
                    d={areaPath} 
                    fill="url(#areaGrad)" 
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Neon Glowing Spline Line */}
                {splinePath && (
                  <path 
                    d={splinePath} 
                    fill="none" 
                    stroke="url(#splineGrad)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    style={{ filter: 'url(#splineGlow)' }}
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Spline Nodes (Pulsing Cyber Dots) */}
                {linePoints.map((pt, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <g 
                      key={idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Transparent hit area */}
                      <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                      
                      {/* Pulsing ring outer */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered ? 7 : 4} 
                        fill="none" 
                        stroke={isHovered ? "#EC4899" : "#C084FC"} 
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                      
                      {/* Inner dot */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered ? 4 : 2} 
                        fill={isHovered ? "#FFFFFF" : "#8B5CF6"} 
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* Baseline Guide */}
                <line 
                  x1={paddingX} 
                  y1={chartHeight - paddingY} 
                  x2={chartWidth - paddingX} 
                  y2={chartHeight - paddingY} 
                  stroke="#334155" 
                  strokeWidth="1.5"
                />
              </svg>

              {/* Dynamic Absolute Glassmorphic Hover Tooltip */}
              {hoveredIndex !== null && reportData[hoveredIndex] && (
                <div 
                  className="absolute z-10 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 shadow-2xl rounded-none text-left pointer-events-none transition-all duration-150 text-xs text-slate-300 w-52"
                  style={{
                    left: `${((paddingX + hoveredIndex * (plotWidth / reportData.length) + (plotWidth / reportData.length) / 2) / chartWidth) * 100}%`,
                    transform: 'translateX(-50%)',
                    bottom: '70px',
                  }}
                >
                  {/* Top neon indicator */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-violet-500" />
                  
                  <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase mb-2 font-mono flex items-center justify-between">
                    <span>PERIOD STATS</span>
                    <span>{reportData[hoveredIndex].period}</span>
                  </p>
                  
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Net Revenue:</span>
                      <span className="font-bold text-white">Rs.{reportData[hoveredIndex].netSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Orders:</span>
                      <span className="font-bold text-white">{reportData[hoveredIndex].ordersCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Avg Value (AOV):</span>
                      <span className="font-bold text-white">Rs.{reportData[hoveredIndex].averageOrderValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Items Sold:</span>
                      <span className="font-bold text-white">{reportData[hoveredIndex].itemsCount}</span>
                    </div>
                    <div className="flex justify-between text-pink-400">
                      <span>Total Discounts:</span>
                      <span className="font-bold">-Rs.{reportData[hoveredIndex].discounts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              <TrendingUp className="w-8 h-8 text-slate-700 mb-3 animate-pulse" />
              <span>No transactions recorded to map trend splines.</span>
            </div>
          )}
        </div>

        {/* Secondary Chart: Cyberpunk Target Velocity Circular Gauge (1/3 width) */}
        <div className="bg-slate-950 text-white p-6 border border-slate-900 shadow-2xl flex flex-col justify-between dark-chart-box relative overflow-hidden">
          {/* Neon Top Trim */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
          
          <div>
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Target Performance</h3>
            <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-0.5 font-mono">Store Milestone Progress</p>
          </div>

          {/* Radial Circular Gauge */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <defs>
                  {/* Ring glow linear gradient */}
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  
                  {/* Gauge filter drop-glow */}
                  <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#06B6D4" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Back Outer Base Ring */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="transparent" 
                  stroke="#1E293B" 
                  strokeWidth="8" 
                  opacity="0.3"
                />

                {/* Glowing Progress Arc */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="transparent" 
                  stroke="url(#gaugeGrad)" 
                  strokeWidth="8" 
                  strokeDasharray="314.16" 
                  strokeDashoffset={314.16 - (314.16 * targetPercent) / 100} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: 'url(#gaugeGlow)' }}
                />
              </svg>

              {/* Centered Percentage HUD */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow">{targetPercent}%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest font-mono mt-0.5">Velocity</span>
              </div>
            </div>

            {/* Target Details Badge */}
            <div className="mt-4 px-3 py-1 bg-slate-900 border border-slate-800 rounded-none text-center font-mono">
              <span className="text-[10px] text-slate-500 font-bold">Milestone Milestone: </span>
              <span className="text-[11px] text-cyan-400 font-black">Rs.{targetMilestone.toLocaleString()}</span>
            </div>
          </div>

          {/* Micro HUD breakdown */}
          <div className="space-y-2 border-t border-slate-900 pt-4 font-mono text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Total Revenue:</span>
              <span className="font-bold text-white">Rs.{totalNetRevenue.toLocaleString()}</span>
            </div>
            {targetPercent < 100 ? (
              <div className="flex justify-between text-slate-400">
                <span>Remaining to Goal:</span>
                <span className="font-bold text-emerald-400">Rs.{Math.max(0, targetMilestone - totalNetRevenue).toLocaleString()}</span>
              </div>
            ) : (
              <div className="text-center text-emerald-400 font-black tracking-widest uppercase animate-bounce pt-1">
                🏆 Milestone Milestone Smashed!
              </div>
            )}
          </div>
        </div>

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
