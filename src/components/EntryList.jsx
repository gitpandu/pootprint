import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

function EntryList({ entries, onDelete, onEdit, t, lang }) {
    if (entries.length === 0) {
        return <div className="text-center text-text-light py-[30px] bg-bg rounded-none">{t.noEntries}</div>;
    }

    // Sort by datetime desc
    const sortedEntries = [...entries].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    const dateLocale = lang === 'id' ? id : enUS;

    const getAmountLabel = (amount) => {
        // Map stored English values to translated values if needed
        if (!amount) return '';
        if (amount === 'Small') return t.amountSmall;
        if (amount === 'Normal') return t.amountNormal;
        if (amount === 'Large') return t.amountLarge;
        return amount;
    }

    return (
        <ul className="list-none p-0 m-0">
            {sortedEntries.map(entry => (
                <li key={entry.id} className="flex items-center py-3 border-b border-border last:border-b-0">
                    <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                        {/* Line 1: Date */}
                        <div className="flex items-center">
                            <span className="font-semibold text-text text-[0.95rem] tabular-nums">
                                {format(new Date(entry.datetime), 'MMM d, yyyy h:mm a', { locale: dateLocale })}
                            </span>
                        </div>

                        {/* Line 2: Labels */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="border border-border text-text py-0.5 px-2 rounded-none text-[0.75rem] font-medium whitespace-nowrap">
                                {t.shortTypes[entry.consistency] || `Type ${entry.consistency}`}
                            </span>
                            {entry.amount && (
                                <span className="border border-border text-text-light py-0.5 px-2 rounded-none text-[0.75rem] font-medium whitespace-nowrap">
                                    {getAmountLabel(entry.amount)}
                                </span>
                            )}
                        </div>

                        {/* Line 3: Note */}
                        {entry.note && (
                            <div className="flex items-center">
                                <span className="text-text-light text-[0.9rem] whitespace-normal break-words italic leading-relaxed">
                                    {entry.note}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <button
                            className="bg-transparent text-text-light border-none cursor-pointer p-3 ml-1 transition-colors duration-200 flex items-center hover:text-text"
                            onClick={() => onEdit(entry)}
                            title="Edit Entry"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            className="bg-transparent text-text-light border-none cursor-pointer p-3 ml-1 transition-colors duration-200 flex items-center hover:text-red-500"
                            onClick={() => onDelete(entry.id)}
                            title="Delete Entry"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default EntryList;
