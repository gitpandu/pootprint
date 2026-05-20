import React, { useState, useEffect } from 'react';
import { Translation } from '../i18n';
import { PoopEntry, EntryInput } from '../hooks/usePoopEntries';

interface TrackerFormProps {
  onAddEntry: (entry: EntryInput) => Promise<void>;
  onUpdateEntry: (id: string, entry: Partial<EntryInput>) => Promise<void>;
  editingEntry: PoopEntry | null;
  setEditingEntry: (entry: PoopEntry | null) => void;
  t: Translation;
}

function TrackerForm({ onAddEntry, onUpdateEntry, editingEntry, setEditingEntry, t }: TrackerFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    consistency: 4,
    amount: 'Normal',
    note: ''
  });

  useEffect(() => {
    if (editingEntry) {
      const d = new Date(editingEntry.datetime);
      setFormData({
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().split(' ')[0].slice(0, 5),
        consistency: editingEntry.consistency,
        amount: editingEntry.amount || '',
        note: editingEntry.note || ''
      });
    }
  }, [editingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entryData: EntryInput = {
      datetime: new Date(`${formData.date}T${formData.time}`).toISOString(),
      consistency: formData.consistency,
      amount: formData.amount,
      note: formData.note
    };
    if (editingEntry) {
      await onUpdateEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      await onAddEntry(entryData);
    }
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      consistency: 4,
      amount: 'Normal',
      note: ''
    });
  };

  const handleQuickLog = async () => {
    const entryData: EntryInput = {
      datetime: new Date().toISOString(),
      consistency: 4,
      amount: 'Normal',
      note: ''
    };
    await onAddEntry(entryData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      consistency: 4,
      amount: 'Normal',
      note: ''
    });
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      consistency: 4,
      amount: 'Normal',
      note: ''
    });
  };

  const setPresetTime = (minutesOffset: number) => {
    const now = new Date();
    if (minutesOffset > 0) {
      now.setMinutes(now.getMinutes() - minutesOffset);
    }
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5)
    }));
  };

  return (
    <>
      <style>{`
        .tf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }

        .tf-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tf-field.full { grid-column: 1 / -1; }

        .tf-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tf-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-60);
        }

        .tf-presets {
          display: flex;
          gap: 8px;
        }

        .tf-preset-btn {
          background: transparent;
          border: none;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.06em;
          color: var(--ink-30);
          cursor: pointer;
          transition: color 0.15s;
          text-transform: uppercase;
          border-bottom: 1px dashed transparent;
        }

        .tf-preset-btn:hover {
          color: var(--ink);
          border-color: var(--ink-30);
        }

        .tf-input {
          appearance: none;
          background: transparent;
          border: 1px solid var(--hairline);
          border-radius: 0;
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 400;
          padding: 10px 12px;
          width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          -webkit-appearance: none;
        }

        .tf-input:focus {
          border-color: var(--ink-60);
          box-shadow: 0 0 0 3px var(--ink-5);
        }

        .tf-input::placeholder { color: var(--ink-30); }

        .tf-input[type="date"]::-webkit-calendar-picker-indicator,
        .tf-input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0.4;
          cursor: pointer;
          filter: var(--ink) invert(0);
        }

        [data-theme="dark"] .tf-input[type="date"]::-webkit-calendar-picker-indicator,
        [data-theme="dark"] .tf-input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        /* Bristol Card Selector */
        .tf-bristol-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin-top: 2px;
        }

        .bristol-card {
          background: transparent;
          border: 1px solid var(--hairline);
          padding: 10px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s var(--ease);
          border-radius: 0;
          color: var(--ink-60);
          text-align: center;
        }

        .bristol-card:hover {
          border-color: var(--hairline-strong);
          color: var(--ink);
          background: var(--ink-5);
        }

        .bristol-num {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .bristol-label {
          font-family: var(--font-sans);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Card Active State */
        .bristol-card.active {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }

        /* Pill Group for Amount */
        .tf-pill-group {
          display: flex;
          border: 1px solid var(--hairline);
          width: 100%;
        }

        .tf-pill {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px 12px;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--ink-60);
          cursor: pointer;
          transition: all 0.12s var(--ease);
          text-align: center;
          outline: none;
        }

        .tf-pill + .tf-pill {
          border-left: 1px solid var(--hairline);
        }

        .tf-pill:hover {
          background: var(--ink-5);
          color: var(--ink);
        }

        .tf-pill.active {
          background: var(--ink);
          color: var(--paper);
        }

        .tf-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }

        .btn-primary {
          flex: 2;
          background: var(--ink);
          color: var(--paper);
          border: 1px solid var(--ink);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 11px 20px;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-primary:hover { opacity: 0.85; }

        .btn-secondary {
          flex: 1.2;
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--ink);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 11px 16px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }

        .btn-secondary:hover {
          background: var(--ink);
          color: var(--paper);
        }

        .btn-ghost {
          background: transparent;
          color: var(--ink-60);
          border: 1px solid var(--hairline);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 11px 20px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }

        .btn-ghost:hover {
          border-color: var(--hairline-strong);
          color: var(--ink);
        }

        /* Mobile Optimization Rules */
        @media (max-width: 500px) {
          .tf-grid {
            gap: 16px 14px;
          }
          .tf-bristol-grid {
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
          }
          .bristol-card {
            padding: 8px 2px;
          }
          .bristol-num {
            font-size: 13px;
            margin-bottom: 1px;
          }
          .bristol-label {
            font-size: 7.5px;
            letter-spacing: -0.02em;
          }
          .tf-pill {
            padding: 8px 6px;
            font-size: 12px;
          }
          .tf-preset-btn {
            font-size: 8px;
            gap: 4px;
          }
        }

        @media (max-width: 400px) {
          .tf-actions {
            gap: 8px;
          }
          .btn-primary, .btn-secondary, .btn-ghost {
            font-size: 9px;
            padding: 10px 10px;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="tf-grid">
          <div className="tf-field">
            <div className="tf-field-header">
              <label className="tf-label">{t.dateAndTime.split(' ')[0] || 'Date'}</label>
              <div className="tf-presets">
                <button type="button" className="tf-preset-btn" onClick={() => setPresetTime(0)}>{t.justNow}</button>
                <button type="button" className="tf-preset-btn" onClick={() => setPresetTime(15)}>{t.minAgo15}</button>
                <button type="button" className="tf-preset-btn" onClick={() => setPresetTime(60)}>{t.hourAgo1}</button>
              </div>
            </div>
            <input
              type="date"
              required
              className="tf-input"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="tf-field">
            <label className="tf-label">Time</label>
            <input
              type="time"
              required
              className="tf-input"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="tf-field full">
            <label className="tf-label">{t.consistency}</label>
            <div className="tf-bristol-grid">
              {[1, 2, 3, 4, 5, 6, 7].map(num => {
                const isSelected = formData.consistency === num;

                const labelText = t.shortTypes[num].includes('(')
                  ? t.shortTypes[num].split('(')[1].replace(')', '')
                  : t.shortTypes[num];

                return (
                  <button
                    key={num}
                    type="button"
                    className={`bristol-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, consistency: num })}
                  >
                    <span className="bristol-num">{num}</span>
                    <span className="bristol-label">{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tf-field">
            <label className="tf-label">{t.amount}</label>
            <div className="tf-pill-group">
              {[
                { value: 'Small', label: t.amountSmall },
                { value: 'Normal', label: t.amountNormal },
                { value: 'Large', label: t.amountLarge }
              ].map(opt => {
                const isSelected = formData.amount === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`tf-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      amount: prev.amount === opt.value ? '' : opt.value
                    }))}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tf-field full">
            <label className="tf-label">{t.notes}</label>
            <input
              type="text"
              className="tf-input"
              placeholder={t.notesPlaceholder}
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        </div>

        <div className="tf-actions">
          <button type="submit" className="btn-primary">
            {editingEntry ? 'Update Entry' : t.logEntry}
          </button>
          {!editingEntry && (
            <button type="button" className="btn-secondary" onClick={handleQuickLog}>
              {t.quickLog}
            </button>
          )}
          {editingEntry && (
            <button type="button" className="btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default TrackerForm;