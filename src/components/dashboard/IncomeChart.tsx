import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatTHB, formatTHBCompact } from "../../utils/currency";

export interface IncomeChartDatum {
  /** Short Thai month label, e.g. "มิ.ย." */
  label: string;
  /** Total income for the month */
  value: number;
  /** Whether this datum is the current (latest) month */
  isCurrent?: boolean;
}

interface IncomeChartProps {
  data: IncomeChartDatum[];
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-md shadow-medium px-3 py-2 font-sans">
      <p className="text-[11px] text-muted mb-0.5">{label}</p>
      <p className="text-sm font-mono font-bold text-ink">
        {formatTHB(payload[0].value)}
      </p>
    </div>
  );
};

export const IncomeChart: React.FC<IncomeChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-center gap-2 select-none">
        <svg className="w-10 h-10 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-muted">ยังไม่มีข้อมูลรายได้ในช่วง 6 เดือนที่ผ่านมา</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "Inter, Kanit, sans-serif" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "Inter, sans-serif" }}
            tickFormatter={(v) => formatTHBCompact(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-surface)" }} />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            isAnimationActive={!prefersReducedMotion()}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill="var(--color-primary)"
                fillOpacity={entry.isCurrent ? 1 : 0.45}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeChart;
