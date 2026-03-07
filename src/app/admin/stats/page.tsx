"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  repairsByFault: { faultType: string; count: number }[];
  repairsByMonth: { month: string; count: number }[];
  repairsByType: { type: string; count: number }[];
  topModels: { model: string; count: number }[];
  totalActive: number;
  completedThisMonth: number;
  revenueThisMonth: number;
  avgRepairDays: number;
}

const PIE_COLORS = ["#0071e3", "#e3a600", "#34c759", "#ff3b30", "#af52de", "#ff9500"];

const MONTHS_FR: Record<string, string> = {
  "01": "Jan",
  "02": "Fev",
  "03": "Mar",
  "04": "Avr",
  "05": "Mai",
  "06": "Juin",
  "07": "Juil",
  "08": "Aout",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

function formatMonth(monthStr: string) {
  const [, m] = monthStr.split("-");
  return MONTHS_FR[m] || m;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Impossible de charger les statistiques.
      </div>
    );
  }

  const monthData = stats.repairsByMonth.map((m) => ({
    ...m,
    label: formatMonth(m.month),
  }));

  const pieData = stats.repairsByType.map((t) => ({
    name: t.type === "POSTAL" ? "Postal" : "Atelier",
    value: t.count,
  }));

  const topFaults = stats.repairsByFault.slice(0, 5);
  const topModels = stats.topModels.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
          Statistiques
        </h1>
        <p className="text-sm text-[#86868b] mt-1">
          Analyse de l&apos;activite de l&apos;atelier
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Repairs by fault type */}
        <Card>
          <CardHeader>
            <CardTitle>Reparations par type de panne</CardTitle>
          </CardHeader>
          {stats.repairsByFault.length === 0 ? (
            <p className="text-sm text-[#86868b] text-center py-8">Aucune donnee disponible</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.repairsByFault} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#86868b" }} />
                  <YAxis
                    type="category"
                    dataKey="faultType"
                    width={130}
                    tick={{ fontSize: 11, fill: "#424245" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="count" fill="#0071e3" radius={[0, 6, 6, 0]} name="Reparations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Repairs over 12 months */}
        <Card>
          <CardHeader>
            <CardTitle>Reparations sur 12 mois</CardTitle>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#86868b" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#86868b" }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0071e3"
                  strokeWidth={2.5}
                  dot={{ fill: "#0071e3", r: 4 }}
                  activeDot={{ r: 6, fill: "#0071e3" }}
                  name="Reparations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Postal vs Local pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Postal vs Atelier</CardTitle>
          </CardHeader>
          {pieData.length === 0 ? (
            <p className="text-sm text-[#86868b] text-center py-8">Aucune donnee disponible</p>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ((props: any) =>
                        `${props.name ?? ""} (${(((props.percent as number) ?? 0) * 100).toFixed(0)}%)`) as any
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top faults and models */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 pannes</CardTitle>
            </CardHeader>
            {topFaults.length === 0 ? (
              <p className="text-sm text-[#86868b] text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {topFaults.map((f, i) => {
                  const max = topFaults[0]?.count || 1;
                  const pct = Math.round((f.count / max) * 100);
                  return (
                    <div key={f.faultType}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#424245]">
                          {i + 1}. {f.faultType}
                        </span>
                        <span className="text-sm font-medium text-[#1d1d1f]">
                          {f.count}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 3 modeles Mac</CardTitle>
            </CardHeader>
            {topModels.length === 0 ? (
              <p className="text-sm text-[#86868b] text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {topModels.map((m, i) => {
                  const medals = ["text-amber-500", "text-gray-400", "text-orange-600"];
                  return (
                    <div
                      key={m.model}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${medals[i] || "text-gray-400"}`}>
                          #{i + 1}
                        </span>
                        <span className="text-sm font-medium text-[#1d1d1f]">
                          {m.model}
                        </span>
                      </div>
                      <span className="text-sm text-[#86868b]">
                        {m.count} reparation{m.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
