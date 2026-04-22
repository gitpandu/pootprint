import { useMemo, useState } from 'react';
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

    const { data, dateRangeLabel } = useMemo(() => {
        const dateLocale = lang === 'id' ? id : enUS;
        const today = startOfDay(new Date());

        if (entries.length === 0) return { data: [], dateRangeLabel: '' };

        if (view === 'yearly') {
            // Last 12 Months with offset (moving back by 12-month chunks)
            const end = subMonths(today, offset * 12);
            const start = startOfMonth(subMonths(end, 11));
            const months = eachMonthOfInterval({ start, end });
            
            const chartData = months.map(month => {
                const count = entries.filter(e => isSameMonth(new Date(e.datetime), month)).length;
                return {
                    dateStr: format(month, 'MMM', { locale: dateLocale }),
                    count: count
                }
            });

            const label = `${format(start, 'MMM yyyy', { locale: dateLocale })} - ${format(end, 'MMM yyyy', { locale: dateLocale })}`;
            return { data: chartData, dateRangeLabel: label };
        } else {
            // Weekly view (7 days) with offset (moving back by 7-day chunks)
            const end = subDays(today, offset * 7);
            const start = subDays(end, 6);
            const days = eachDayOfInterval({ start, end });

            const chartData = days.map(day => {
                const count = entries.filter(e => isSameDay(new Date(e.datetime), day)).length;
                return {
                    dateStr: format(day, 'MMM dd', { locale: dateLocale }),
                    count: count
                };
            });

            const label = `${format(start, 'MMM dd', { locale: dateLocale })} - ${format(end, 'MMM dd', { locale: dateLocale })}`;
            return { data: chartData, dateRangeLabel: label };
        }
    }, [entries, lang, view, offset]);

    if (entries.length === 0) {
        return <div className="text-center text-text-light py-[30px] bg-bg rounded-none">{t.noData}</div>;
    }

    const isDark = theme === 'dark';
    const cursorFill = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6';
    const tooltipStyle = isDark
        ? { backgroundColor: '#1f2937', color: '#f9fafb', border: '1px solid #374151', borderRadius: '8px' }
        : { backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[0.8rem] font-medium text-text-light uppercase tracking-tight">
                    {dateRangeLabel}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setOffset(prev => prev + 1)}
                        className="p-1 border border-border text-text hover:bg-border transition-colors cursor-pointer"
                        title="Previous"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setOffset(prev => prev - 1)}
                        disabled={offset === 0}
                        className="p-1 border border-border text-text hover:bg-border transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Next"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="w-full h-[250px]">
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis
                            dataKey="dateStr"
                            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                            axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                            tickLine={false}
                            interval={0}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
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
                            barSize={view === 'yearly' ? 24 : 32}
                            name={t.chartLabel}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default TrackerChart;
