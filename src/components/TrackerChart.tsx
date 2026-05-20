import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
  const [chartMetric, setChartMetric] = useState<'frequency' | 'consistency'>('frequency');

  useEffect(() => { setIsMounted(true); }, []);

  // 1. Calculate Active Streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const loggedDates = Array.from(new Set(
      entries.map(e => new Date(e.datetime).toLocaleDateString('en-CA'))
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (loggedDates.length === 0) return 0;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    const newestLogDate = loggedDates[0];
    if (newestLogDate !== todayStr && newestLogDate !== yesterdayStr) {
      return 0;
    }

    let currentStreak = 0;
    let currentDate = new Date(newestLogDate);

    for (let i = 0; i < loggedDates.length; i++) {
      const expectedStr = currentDate.toLocaleDateString('en-CA');
      if (loggedDates.includes(expectedStr)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [entries]);

  // 2. Calculate Dominant Type
  const dominantTypeInfo = useMemo(() => {
    if (entries.length === 0) return { score: 0, text: '-' };
    const counts: Record<number, number> = {};
    let maxCount = 0;
    let dominantVal = 4;

    entries.forEach(e => {
      counts[e.consistency] = (counts[e.consistency] || 0) + 1;
      if (counts[e.consistency] > maxCount) {
        maxCount = counts[e.consistency];
        dominantVal = e.consistency;
      }
    });

    const labelText = t.shortTypes[dominantVal] || `Type ${dominantVal}`;
    return {
      score: dominantVal,
      text: labelText.includes('(') ? labelText.split('(')[1].replace(')', '') : labelText
    };
  }, [entries, t]);

  // 3. Calculate Average Consistency
  const averageConsistency = useMemo(() => {
    if (entries.length === 0) return { score: 0, label: '-', color: 'var(--ink-30)' };
    const sum = entries.reduce((acc, e) => acc + e.consistency, 0);
    const avg = Number((sum / entries.length).toFixed(1));

    let label = '';
    let color = '';
    if (avg <= 2.5) {
      label = lang === 'id' ? 'Sembelit' : 'Constipation';
      color = '#d97706';
    } else if (avg <= 4.5) {
      label = lang === 'id' ? 'Ideal' : 'Ideal';
      color = '#059669';
    } else if (avg <= 5.5) {
      label = lang === 'id' ? 'Lunak' : 'Soft';
      color = '#2563eb';
    } else {
      label = lang === 'id' ? 'Cair' : 'Loose';
      color = '#dc2626';
    }
    return { score: avg, label, color };
  }, [entries, lang]);

  // 4. Calculate Chart Data
  const { data, dateRangeLabel } = useMemo(() => {
    const locale = lang === 'id' ? id : enUS;
    const today = startOfDay(new Date());
    if (entries.length === 0) return { data: [], dateRangeLabel: '' };

    if (view === 'yearly') {
      const end = subMonths(today, offset * 12);
      const start = startOfMonth(subMonths(end, 11));
      const months = eachMonthOfInterval({ start, end });
      const chartData = months.map(month => {
        const monthEntries = entries.filter(e => isSameMonth(new Date(e.datetime), month));
        const count = monthEntries.length;
        const avg = count > 0 ? Number((monthEntries.reduce((s, e) => s + e.consistency, 0) / count).toFixed(1)) : null;
        return {
          dateStr: format(month, 'MMM', { locale }),
          count,
          avgConsistency: avg
        };
      });
      return {
        data: chartData,
        dateRangeLabel: `${format(start, 'MMM yyyy', { locale })} — ${format(end, 'MMM yyyy', { locale })}`
      };
    } else {
      const end = subDays(today, offset * 7);
      const start = subDays(end, 6);
      const days = eachDayOfInterval({ start, end });
      const chartData = days.map(day => {
        const dayEntries = entries.filter(e => isSameDay(new Date(e.datetime), day));
        const count = dayEntries.length;
        const avg = count > 0 ? Number((dayEntries.reduce((s, e) => s + e.consistency, 0) / count).toFixed(1)) : null;
        return {
          dateStr: format(day, 'MMM dd', { locale }),
          count,
          avgConsistency: avg
        };
      });
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
        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--hairline);
          padding-bottom: 20px;
        }

        @media (max-width: 600px) {
          .stats-strip {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }

        .stat-card {
          background: var(--paper);
          border: 1px solid var(--hairline);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: border-color 0.2s var(--ease);
        }

        .stat-card:hover {
          border-color: var(--hairline-strong);
        }

        .stat-val {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 6px;
          line-height: 1.2;
        }

        .stat-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }

        .stat-lbl {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-30);
        }

        .stat-sub {
          font-family: var(--font-sans);
          font-size: 10px;
          color: var(--ink-60);
          text-transform: capitalize;
        }

        .chart-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chart-range {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--ink-30);
          text-transform: uppercase;
        }

        .chart-actions-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .seg-ctrl.mini {
          border: 1px solid var(--hairline);
        }

        .seg-ctrl.mini .seg-btn {
          padding: 4px 10px;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .chart-arrows { display: flex; gap: 6px; }

        .arrow-btn {
          width: 26px;
          height: 26px;
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

      {/* KPI Stats Strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <span className="stat-lbl">{t.statsAverage}</span>
          <div className="stat-val">
            <span className="stat-dot" style={{ backgroundColor: averageConsistency.color }} />
            {averageConsistency.score > 0 ? averageConsistency.score : '-'}
          </div>
          <span className="stat-sub" style={{ color: averageConsistency.color }}>{averageConsistency.label}</span>
        </div>

        <div className="stat-card">
          <span className="stat-lbl">{t.statsStreak}</span>
          <div className="stat-val">{streak}</div>
          <span className="stat-sub">{streak} {t.daysActive}</span>
        </div>

        <div className="stat-card">
          <span className="stat-lbl">{t.statsDominant}</span>
          <div className="stat-val">Type {dominantTypeInfo.score > 0 ? dominantTypeInfo.score : '-'}</div>
          <span className="stat-sub">{dominantTypeInfo.text}</span>
        </div>

        <div className="stat-card">
          <span className="stat-lbl">{t.statsTotal}</span>
          <div className="stat-val">{entries.length}</div>
          <span className="stat-sub">{t.history.toLowerCase()}</span>
        </div>
      </div>

      <div className="chart-nav">
        <span className="chart-range">{dateRangeLabel}</span>
        <div className="chart-actions-group">
          {/* Dual Toggle */}
          <div className="seg-ctrl mini">
            <button
              className={`seg-btn${chartMetric === 'frequency' ? ' on' : ''}`}
              onClick={() => setChartMetric('frequency')}
            >
              {t.frequency}
            </button>
            <button
              className={`seg-btn${chartMetric === 'consistency' ? ' on' : ''}`}
              onClick={() => setChartMetric('consistency')}
            >
              Trend
            </button>
          </div>

          <div className="chart-arrows">
            <button className="arrow-btn" onClick={() => setOffset(p => p + 1)} title="Previous">
              <ChevronLeft size={14} />
            </button>
            <button className="arrow-btn" onClick={() => setOffset(p => p - 1)} disabled={offset === 0} title="Next">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        {isMounted && chartMetric === 'frequency' && (
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

        {isMounted && chartMetric === 'consistency' && (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <LineChart data={data} margin={{ top: 6, right: 12, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="dateStr"
                tick={{ fontSize: 10, fill: tickColor, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[1, 7]}
                ticks={[1, 2, 3, 4, 5, 6, 7]}
                tick={{ fontSize: 10, fill: tickColor, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
              />
              <ReferenceLine
                y={4}
                stroke="#059669"
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.35}
              />
              <ReferenceLine
                y={3}
                stroke="#059669"
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.35}
              />
              <Line
                type="monotone"
                dataKey="avgConsistency"
                stroke={barFill}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: isDark ? '#1c1a17' : '#faf9f6' }}
                activeDot={{ r: 5 }}
                connectNulls={true}
                name={t.consistency.split(' ')[0]}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default TrackerChart;