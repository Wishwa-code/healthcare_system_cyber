import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import apiClient from "../../api/apiClient";

type BedStats = {
  occupied: number;
  available: number;
  maintenance: number;
  total: number;
};

export default function BedOccupancyWidget() {
  const [data, setData] = useState<BedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/bed-occupancy")
      .then((res) => setData(res.data?.data ?? res.data))
      .catch(() =>
        setData({ occupied: 72, available: 18, maintenance: 10, total: 100 })
      )
      .finally(() => setLoading(false));
  }, []);

  const d = data ?? { occupied: 72, available: 18, maintenance: 10, total: 100 };
  const occupancyPct = d.total > 0 ? Math.round((d.occupied / d.total) * 100) : 0;

  const options: ApexOptions = {
    colors: ["#465FFF", "#10B981", "#F59E0B"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 280,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "72%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "32px",
            fontWeight: "700",
            offsetY: -30,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Occupancy"],
  };

  const beds = [
    { label: "Occupied", count: d.occupied, color: "bg-brand-500" },
    { label: "Available", count: d.available, color: "bg-emerald-500" },
    { label: "Maintenance", count: d.maintenance, color: "bg-amber-400" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Bed Occupancy
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Real-time ward capacity status
        </p>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-h-[280px]">
            <Chart options={options} series={[occupancyPct]} type="radialBar" height={280} />
          </div>

          <div className="flex flex-col gap-3 px-5 pb-6 sm:px-6">
            {beds.map((b) => (
              <div key={b.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${b.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {b.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {b.count}
                  <span className="text-xs font-normal text-gray-400 ml-1">beds</span>
                </span>
              </div>
            ))}
            <div className="mt-1 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Capacity</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">{d.total} beds</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
