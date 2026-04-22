import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay, startOfMonth, subMonths, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Translation } from '../i18n';
import { PoopEntry } from '../hooks/usePoopEntries';

interface TrackerChartProps {
  entries: PoopEntry[];
  theme: string;
  t: Translation;
  lang: string;
  view?: 'weekly' | 'yearly';
}

function TrackerChart({ entries, theme, t, lang, view = 'weekly' }: TrackerChartProps) {
  const [offset, setOffset] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const { data, dateRangeLabel } = useMemo(() => {
    const locale = lang === 'id' ? id : enUS;
    const today = startOfDay(new Date());
    if (entries.length === 0) return { data: [], dateRangeLabel: '' };

    if (view === 'yearly') {
      const end = subMonths(today, offset * 12);
      const start = startOfMonth(subMonths(end, 11));
      const months = eachMonthOfInterval({ start, end });
      const chartData = months.map(month => ({
        dateStr: format(month, 'MMM', { locale }),
        count: entries.filter(e => isSameMonth(new Date(e.datetime), month)).length
      }));
      return {
        data: chartData,
        dateRangeLabel: `${format(start, 'MMM yyyy', { locale })} — ${format(end, 'MMM yyyy', { locale })}`
      };
    } else {
      const end = subDays(today, offset * 7);
      const start = subDays(end, 6);
      const days = eachDayOfInterval({ start, end });
      const chartData = days.map(day => ({
        dateStr: format(day, 'MMM dd', { locale }),
        count: entries.filter(e => isSameDay(new Date(e.datetime), day)).length
      }));
      return {
        data: chartData,
        dateRangeLabel: `${format(start, 'MMM dd', { locale })} — ${format(end, 'MMM dd', { locale })}`
      };
    }
  }, [entries, lang, view, offset]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(237,233,227,0.08)' : 'rgba(10,10,10,0.07)';
  const tickColor = isDark ? 'rgba(237,233,227,0.4)' : 'rgba(10,10,10,0.4)';
  const barFill = isDark ? '#ede9e3' : '#0a0a0a';
  const cursorFill = isDark ? 'rgba(237,233,227,0.04)' : 'rgba(10,10,10,0.03)';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1c1a17' : '#faf9f6',
    border: `1px solid ${isDark ? 'rgba(237,233,227,0.12)' : 'rgba(10,10,10,0.11)'}`,
    borderRadius: 0,
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: isDark ? '#ede9e3' : '#0a0a0a',
    boxShadow: 'none',
    padding: '8px 12px',
  };

  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        color: 'var(--ink-30)',
        textTransform: 'uppercase',
      }}>
        {t.noData}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .chart-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .chart-range {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--ink-30);
          text-transform: uppercase;
        }

        .chart-arrows { display: flex; gap: 6px; }

        .arrow-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--hairline);
          color: var(--ink-60);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }

        .arrow-btn:hover:not(:disabled) {
          border-color: var(--hairline-strong);
          color: var(--ink);
          background: var(--ink-5);
        }

        .arrow-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .chart-wrap {
          width: 100%;
          height: 220px;
        }
      `}</style>

      <div className="chart-nav">
        <span className="chart-range">{dateRangeLabel}</span>
        <div className="chart-arrows">
          <button className="arrow-btn" onClick={() => setOffset(p => p + 1)} title="Previous">
            <ChevronLeft size={14} />
          </button>
          <button className="arrow-btn" onClick={() => setOffset(p => p - 1)} disabled={offset === 0} title="Next">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="chart-wrap">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="dateStr"
                tick={{ fontSize: 10, fill: tickColor, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: tickColor, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: cursorFill }}
                contentStyle={tooltipStyle}
              />
              <Bar
                dataKey="count"
                fill={barFill}
                radius={[0, 0, 0, 0]}
                barSize={view === 'yearly' ? 20 : 28}
                name={t.chartLabel}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default TrackerChart;