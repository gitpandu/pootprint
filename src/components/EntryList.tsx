import { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { Translation } from '../i18n';
import { PoopEntry } from '../hooks/usePoopEntries';

interface EntryListProps {
  entries: PoopEntry[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (entry: PoopEntry) => void;
  t: Translation;
  lang: string;
}

function EntryList({ entries, onDelete, onEdit, t, lang }: EntryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const sorted = [...entries].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const locale = lang === 'id' ? id : enUS;

  const getAmountLabel = (amount: string) => {
    if (!amount) return null;
    if (amount === 'Small') return t.amountSmall;
    if (amount === 'Normal') return t.amountNormal;
    if (amount === 'Large') return t.amountLarge;
    return amount;
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
        {t.noEntries}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .entry-list {
          list-style: none;
        }

        .entry-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--hairline);
          transition: background 0.12s;
        }

        .entry-row:last-child { border-bottom: none; }

        .entry-row:hover { background: var(--ink-5); margin: 0 -12px; padding: 14px 12px; }

        .entry-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }

        .entry-datetime {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink);
          letter-spacing: 0.02em;
          font-weight: 400;
        }

        .entry-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .tag {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 8px;
          border: 1px solid var(--hairline);
          color: var(--ink-60);
        }

        .tag.primary { border-color: var(--ink-30); color: var(--ink); }

        .entry-note {
          font-size: 12.5px;
          color: var(--ink-60);
          font-style: italic;
          line-height: 1.5;
          font-family: var(--font-serif);
        }

        .entry-actions {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--ink-30);
          transition: color 0.15s;
          border-radius: 0;
        }

        .action-btn:hover { color: var(--ink); }
        .action-btn.danger:hover { color: #c0392b; }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          margin-top: 8px;
          border-top: 1px solid var(--hairline);
        }

        .page-info {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-30);
        }

        .page-arrows { display: flex; gap: 6px; }

        .page-btn {
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

        .page-btn:hover:not(:disabled) {
          border-color: var(--hairline-strong);
          color: var(--ink);
          background: var(--ink-5);
        }

        .page-btn:disabled { opacity: 0.2; cursor: not-allowed; }
      `}</style>

      <ul className="entry-list">
        {paginated.map(entry => (
          <li key={entry.id} className="entry-row">
            <div className="entry-body">
              <div className="entry-datetime">
                {format(new Date(entry.datetime), 'MMM d, yyyy · h:mm a', { locale })}
              </div>
              <div className="entry-tags">
                <span className="tag primary">
                  {t.shortTypes[entry.consistency] || `Type ${entry.consistency}`}
                </span>
                {entry.amount && (
                  <span className="tag">{getAmountLabel(entry.amount)}</span>
                )}
              </div>
              {entry.note && (
                <div className="entry-note">"{entry.note}"</div>
              )}
            </div>
            <div className="entry-actions">
              <button className="action-btn" onClick={() => onEdit(entry)} title="Edit">
                <Edit size={13} />
              </button>
              <button className="action-btn danger" onClick={() => onDelete(entry.id)} title="Delete">
                <Trash2 size={13} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="pagination">
          <span className="page-info">Page {currentPage} / {totalPages}</span>
          <div className="page-arrows">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={13} />
            </button>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default EntryList;