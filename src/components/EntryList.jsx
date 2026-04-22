import React, { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

function EntryList({ entries, onDelete, onEdit, t, lang }) {
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 5;

    // Sort by datetime desc
    const sortedEntries = [...entries].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    const totalPages = Math.ceil(sortedEntries.length / PAGE_SIZE);

    // Adjust page if it's out of bounds (e.g. after deletion)
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const paginatedEntries = sortedEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const dateLocale = lang === 'id' ? id : enUS;

    const getAmountLabel = (amount) => {
        if (!amount) return '';
        if (amount === 'Small') return t.amountSmall;
        if (amount === 'Normal') return t.amountNormal;
        if (amount === 'Large') return t.amountLarge;
        return amount;
    }

    return (
        <div>
            <ul className="list-none p-0 m-0">
                {paginatedEntries.map(entry => (
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

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                    <span className="text-[0.8rem] text-text-light font-medium uppercase tracking-tight">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1 border border-border text-text hover:bg-border transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                            title="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1 border border-border text-text hover:bg-border transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                            title="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EntryList;
