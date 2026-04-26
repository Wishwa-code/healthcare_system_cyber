import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import apiClient from "../../api/apiClient";

type WeeklyData = {
  day: string;
  opd: number;
  ipd: number;
  pharmacy: number;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FALLBACK: WeeklyData[] = [
  { day: "Mon", opd: 42, ipd: 8, pharmacy: 120 },
  { day: "Tue", opd: 55, ipd: 12, pharmacy: 145 },
  { day: "Wed", opd: 38, ipd: 7, pharmacy: 98 },
  { day: "Thu", opd: 68, ipd: 15, pharmacy: 180 },
  { day: "Fri", opd: 75, ipd: 18, pharmacy: 210 },
  { day: "Sat", opd: 30, ipd: 5, pharmacy: 75 },
  { day: "Sun", opd: 20, ipd: 3, pharmacy: 45 },
];

export default function WeeklyActivityChart() {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/weekly-activity")
      .then((res) => setData(res.data?.data ?? res.data ?? []))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const src = data.length > 0 ? data : FALLBACK;
  const opdData = DAYS.map((d) => src.find((r) => r.day === d)?.opd ?? 0);
  const ipdData = DAYS.map((d) => src.find((r) => r.day === d)?.ipd ?? 0);
  const rxData = DAYS.map((d) => src.find((r) => r.day === d)?.pharmacy ?? 0);

  const options: ApexOptions = {
    legend: { show: false, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#10B981", "#F59E0B"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: [2, 2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#F3F4F6",
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, x: { show: true } },
    xaxis: {
      type: "category",
      categories: DAYS,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "12px", colors: "#6B7280" } },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
  };

  const series = [
    { name: "OPD", data: opdData },
    { name: "IPD", data: ipdData },
    { name: "Prescriptions", data: rxData },
  ];

  const legendItems = [
    { label: "OPD Visits", color: "bg-brand-500" },
    { label: "IPD Admissions", color: "bg-emerald-500" },
    { label: "Prescriptions", color: "bg-amber-400" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Weekly Activity
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            This week's OPD, IPD & prescription trends
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {legendItems.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${l.color}`} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[310px] flex items-center justify-center">
          <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[600px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
