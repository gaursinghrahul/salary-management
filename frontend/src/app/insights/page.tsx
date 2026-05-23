"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, CountryStats, DepartmentStats, TopEarner } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function InsightsPage() {
  const [countries, setCountries] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [countryStats, setCountryStats] = useState<CountryStats | null>(null);
  const [jobTitleAvg, setJobTitleAvg] = useState<{
    avg: number;
    count: number;
  } | null>(null);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [loadingJobTitle, setLoadingJobTitle] = useState(false);

  // Load reference data + dept stats + top earners on mount
  useEffect(() => {
    api.insights.countries().then((cs) => {
      setCountries(cs);
      if (cs.length) setSelectedCountry(cs[0]);
    });
    api.insights.jobTitles().then((jts) => {
      setJobTitles(jts);
      if (jts.length) setSelectedJobTitle(jts[0]);
    });
    api.insights
      .departmentStats()
      .then(setDeptStats)
      .catch(() => {});
    api.insights
      .topEarners(10)
      .then(setTopEarners)
      .catch(() => {});
  }, []);

  // Fetch country stats when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    setLoadingCountry(true);
    api.insights
      .countryStats(selectedCountry)
      .then(setCountryStats)
      .catch(() => {})
      .finally(() => setLoadingCountry(false));
  }, [selectedCountry]);

  // Fetch job title avg when either filter changes
  useEffect(() => {
    if (!selectedJobTitle || !selectedCountry) return;
    setLoadingJobTitle(true);
    api.insights
      .jobTitleAvg(selectedJobTitle, selectedCountry)
      .then(setJobTitleAvg)
      .catch(() => {})
      .finally(() => setLoadingJobTitle(false));
  }, [selectedJobTitle, selectedCountry]);

  const deptChartData = deptStats.map((d) => ({
    name: d.department,
    avg: Math.round(d.avg),
    min: d.min,
    max: d.max,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Salary Insights</h2>
        <p className="text-sm text-gray-500 mt-1">
          Analytics across all employees
        </p>
      </div>

      {/* Country selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <select
              value={selectedJobTitle}
              onChange={(e) => setSelectedJobTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {jobTitles.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country stats cards */}
        {loadingCountry ? (
          <div className="text-sm text-gray-400">Loading country stats…</div>
        ) : countryStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Employees"
              value={countryStats.count.toLocaleString()}
            />
            <StatCard
              label="Min Salary"
              value={formatCurrency(countryStats.min)}
            />
            <StatCard
              label="Max Salary"
              value={formatCurrency(countryStats.max)}
            />
            <StatCard
              label="Avg Salary"
              value={formatCurrency(countryStats.avg)}
            />
          </div>
        ) : null}

        {/* Job title avg in country */}
        {!loadingJobTitle && jobTitleAvg && selectedJobTitle && (
          <div className="mt-2 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              <span className="font-semibold">{selectedJobTitle}</span> in{" "}
              <span className="font-semibold">{selectedCountry}</span>: avg
              salary{" "}
              <span className="font-bold">
                {formatCurrency(jobTitleAvg.avg)}
              </span>{" "}
              across <span className="font-semibold">{jobTitleAvg.count}</span>{" "}
              employee
              {jobTitleAvg.count !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Department salary chart */}
      {deptChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold mb-4">
            Average Salary by Department
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={deptChartData}
              margin={{ top: 4, right: 16, left: 16, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar
                dataKey="avg"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="Avg Salary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top earners */}
      {topEarners.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold">Top 10 Earners</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "Name", "Job Title", "Country", "Salary"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topEarners.map((e, i) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-medium">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{e.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{e.jobTitle}</td>
                  <td className="px-4 py-3 text-gray-600">{e.country}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">
                    {formatCurrency(e.salary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
