import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay, startOfMonth, subMonths, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

function TrackerChart({ entries, theme, t, lang, view = 'weekly' }) {
    const data = useMemo(() => {
        if (entries.length === 0) return [];

        const dateLocale = lang === 'id' ? id : enUS;
        const today = startOfDay(new Date());

        if (view === 'yearly') {
            // Last 12 Months
            const start = startOfMonth(subMonths(today, 11));
            const months = eachMonthOfInterval({ start, end: today });
            return months.map(month => {
                const count = entries.filter(e => isSameMonth(new Date(e.datetime), month)).length;
                return {
                    dateStr: format(month, 'MMM', { locale: dateLocale }),
                    count: count
                }
            });
        } else {
            // Weekly view (7 days)
            const start = subDays(today, 6);
            const days = eachDayOfInterval({ start, end: today });

            return days.map(day => {
                const count = entries.filter(e => isSameDay(new Date(e.datetime), day)).length;
                return {
                    dateStr: format(day, 'MMM dd', { locale: dateLocale }),
                    count: count
                };
            });
        }
    }, [entries, lang, view]);

    if (entries.length === 0) {
        return <div className="empty-state">{t.noData}</div>;
    }

    const isDark = theme === 'dark';
    const cursorFill = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6';
    const tooltipStyle = isDark
        ? { backgroundColor: '#1f2937', color: '#f9fafb', border: '1px solid #374151', borderRadius: '8px' }
        : { backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis
                        dataKey="dateStr"
                        tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                        tickLine={false}
                        interval={0}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: cursorFill }}
                        contentStyle={tooltipStyle}
                    />
                    <Bar
                        dataKey="count"
                        fill={isDark ? '#ffffff' : '#000000'}
                        radius={[0, 0, 0, 0]}
                        barSize={32}
                        name={t.chartLabel}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TrackerChart;
