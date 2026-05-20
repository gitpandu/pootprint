import { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'constipation' | 'ideal' | 'loose'>('all');
  const PAGE_SIZE = 5;

  const sorted = [...entries].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  // Apply search and category filtering
  const filtered = sorted.filter(entry => {
    // 1. Search Query filter (matches notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!entry.note || !entry.note.toLowerCase().includes(q)) {
        return false;
      }
    }
    // 2. Bristol Category filters
    if (activeFilter === 'constipation') {
      return entry.consistency <= 2;
    }
    if (activeFilter === 'ideal') {
      return entry.consistency === 3 || entry.consistency === 4;
    }
    if (activeFilter === 'loose') {
      return entry.consistency >= 5;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
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
        .el-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--hairline);
          padding-bottom: 16px;
        }

        .el-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .el-search-icon {
          position: absolute;
          left: 12px;
          color: var(--ink-30);
          pointer-events: none;
        }

        .el-search {
          appearance: none;
          background: transparent;
          border: 1px solid var(--hairline);
          border-radius: 0;
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 13px;
          padding: 9px 12px 9px 34px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s var(--ease), box-shadow 0.15s var(--ease);
        }

        .el-search:focus {
          border-color: var(--ink-60);
          box-shadow: 0 0 0 3px var(--ink-5);
        }

        .el-filters {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }

        .el-filter-chip {
          background: transparent;
          border: 1px solid var(--hairline);
          padding: 4px 10px;
          font-family: var(--font-mono);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-60);
          cursor: pointer;
          transition: all 0.15s var(--ease);
          white-space: nowrap;
          outline: none;
        }

        .el-filter-chip:hover {
          border-color: var(--hairline-strong);
          color: var(--ink);
          background: var(--ink-5);
        }

        .el-filter-chip.active {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }

        .entry-list {
          list-style: none;
        }

        .entry-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid var(--hairline);
          transition: all 0.2s var(--ease);
          transform: translateY(0);
        }

        .entry-row:last-child { border-bottom: none; }

        .entry-row:hover {
          background: var(--ink-5);
          margin: 0 -12px;
          padding: 16px 12px;
          transform: translateY(-1px);
        }

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

        .tag.primary {
          border: 1px solid var(--hairline-strong);
          color: var(--ink);
        }

        /* Color Badges for Stool Quality */
        .tag.primary.constipation {
          border-color: #d97706;
          color: #d97706;
          background: rgba(217, 119, 6, 0.05);
        }

        .tag.primary.healthy {
          border-color: #059669;
          color: #059669;
          background: rgba(5, 150, 105, 0.05);
        }

        .tag.primary.soft {
          border-color: #2563eb;
          color: #2563eb;
          background: rgba(37, 99, 235, 0.05);
        }

        .tag.primary.loose {
          border-color: #dc2626;
          color: #dc2626;
          background: rgba(220, 38, 38, 0.05);
        }

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

      {/* Search & Filters Strip */}
      <div className="el-controls">
        <div className="el-search-wrapper">
          <Search size={14} className="el-search-icon" />
          <input
            type="text"
            className="el-search"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="el-filters">
          <button
            className={`el-filter-chip${activeFilter === 'all' ? ' active' : ''}`}
            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
          >
            {t.filterAll}
          </button>
          <button
            className={`el-filter-chip${activeFilter === 'constipation' ? ' active' : ''}`}
            onClick={() => { setActiveFilter('constipation'); setCurrentPage(1); }}
          >
            {t.filterConstipation.split(' ')[0] || 'Constipated'}
          </button>
          <button
            className={`el-filter-chip${activeFilter === 'ideal' ? ' active' : ''}`}
            onClick={() => { setActiveFilter('ideal'); setCurrentPage(1); }}
          >
            {t.filterIdeal.split(' ')[0] || 'Ideal'}
          </button>
          <button
            className={`el-filter-chip${activeFilter === 'loose' ? ' active' : ''}`}
            onClick={() => { setActiveFilter('loose'); setCurrentPage(1); }}
          >
            {t.filterLoose.split(' ')[0] || 'Loose'}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'var(--ink-30)',
          textTransform: 'uppercase',
        }}>
          {lang === 'id' ? 'Tidak ada hasil ditemukan' : 'No results found'}
        </div>
      ) : (
        <ul className="entry-list">
          {paginated.map(entry => {
            let catClass = 'healthy';
            if (entry.consistency <= 2) catClass = 'constipation';
            else if (entry.consistency === 5) catClass = 'soft';
            else if (entry.consistency >= 6) catClass = 'loose';

            return (
              <li key={entry.id} className="entry-row">
                <div className="entry-body">
                  <div className="entry-datetime">
                    {format(new Date(entry.datetime), 'MMM d, yyyy · h:mm a', { locale })}
                  </div>
                  <div className="entry-tags">
                    <span className={`tag primary ${catClass}`}>
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
            );
          })}
        </ul>
      )}

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