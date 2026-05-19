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
    consistency: 6,
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
      consistency: 6,
      amount: 'Normal',
      note: ''
    });
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      consistency: 6,
      amount: 'Normal',
      note: ''
    });
  };

  return (
    <>
      <style>{`
        .tf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
        }

        .tf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tf-field.full { grid-column: 1 / -1; }

        .tf-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-60);
        }

        .tf-input, .tf-select {
          appearance: none;
          background: transparent;
          border: 1px solid var(--hairline);
          border-radius: 0;
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 400;
          padding: 9px 12px;
          width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          -webkit-appearance: none;
        }

        .tf-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(10,10,10,0.3)'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
          cursor: pointer;
        }

        [data-theme="dark"] .tf-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(237,233,227,0.4)'/%3E%3C/svg%3E");
        }

        .tf-input:focus, .tf-select:focus {
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

        .tf-select option { background: var(--paper); color: var(--ink); }

        .tf-actions {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .btn-primary {
          flex: 1;
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

        .btn-primary:hover { opacity: 0.8; }

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

        @media (max-width: 480px) {
          .tf-grid { grid-template-columns: 1fr; }
          .tf-field.full { grid-column: 1; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="tf-grid">
          <div className="tf-field">
            <label className="tf-label">{t.dateAndTime.split(' ')[0] || 'Date'}</label>
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

          <div className="tf-field">
            <label className="tf-label">{t.consistency}</label>
            <select
              className="tf-select"
              value={formData.consistency}
              onChange={e => setFormData({ ...formData, consistency: Number(e.target.value) })}
            >
              {Object.entries(t.types).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="tf-field">
            <label className="tf-label">{t.amount}</label>
            <select
              className="tf-select"
              value={formData.amount || ''}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            >
              <option value="">{t.selectAmount}</option>
              <option value="Small">{t.amountSmall}</option>
              <option value="Normal">{t.amountNormal}</option>
              <option value="Large">{t.amountLarge}</option>
            </select>
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