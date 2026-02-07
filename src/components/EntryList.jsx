import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

function EntryList({ entries, onDelete, onEdit, t, lang }) {
    if (entries.length === 0) {
        return <div className="empty-state">{t.noEntries}</div>;
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
        <ul className="entry-list">
            {sortedEntries.map(entry => (
                <li key={entry.id} className="entry-item">
                    <div className="entry-details">
                        {/* Line 1: Date */}
                        <div className="entry-row">
                            <span className="entry-date">
                                {format(new Date(entry.datetime), 'MMM d, yyyy h:mm a', { locale: dateLocale })}
                            </span>
                        </div>

                        {/* Line 2: Labels */}
                        <div className="entry-row entry-chips">
                            <span className="entry-type">
                                {t.shortTypes[entry.consistency] || `Type ${entry.consistency}`}
                            </span>
                            {entry.amount && (
                                <span className="entry-amount">
                                    {getAmountLabel(entry.amount)}
                                </span>
                            )}
                        </div>

                        {/* Line 3: Note */}
                        {entry.note && (
                            <div className="entry-row">
                                <span className="entry-note">
                                    {entry.note}
                                </span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                            className="btn-edit"
                            onClick={() => onEdit(entry)}
                            title="Edit Entry"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            className="btn-delete"
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
