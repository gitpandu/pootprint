import React, { useState } from 'react';

function TrackerForm({ onAddEntry, onUpdateEntry, editingEntry, setEditingEntry, t }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        consistency: 4, // Default to Normal
        amount: '',
        note: ''
    });

    React.useEffect(() => {
        if (editingEntry) {
            const dateObj = new Date(editingEntry.datetime);
            setFormData({
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toTimeString().split(' ')[0].slice(0, 5),
                consistency: editingEntry.consistency,
                amount: editingEntry.amount || '',
                note: editingEntry.note || ''
            });
        }
    }, [editingEntry]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const entryData = {
            datetime: new Date(`${formData.date}T${formData.time}`).toISOString(),
            consistency: formData.consistency,
            amount: formData.amount,
            note: formData.note
        };

        if (editingEntry) {
            await onUpdateEntry(editingEntry.id, entryData);
            setEditingEntry(null);
        } else {
            onAddEntry(entryData);
        }

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].slice(0, 5),
            consistency: 4,
            amount: '',
            note: ''
        });
    };

    const handleCancel = () => {
        setEditingEntry(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].slice(0, 5),
            consistency: 4,
            amount: '',
            note: ''
        });
    };

    return (
        <form className="tracker-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>{t.dateAndTime}</label>
                <div className="datetime-inputs">
                    <input
                        type="date"
                        required
                        className="form-control"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                    <input
                        type="time"
                        required
                        className="form-control"
                        value={formData.time}
                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>{t.consistency}</label>
                <select
                    className="form-control"
                    value={formData.consistency}
                    onChange={e => setFormData({ ...formData, consistency: Number(e.target.value) })}
                >
                    {Object.entries(t.types).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>{t.amount}</label>
                <select
                    className="form-control"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                >
                    <option value="">{t.selectAmount}</option>
                    <option value="Small">{t.amountSmall}</option>
                    <option value="Normal">{t.amountNormal}</option>
                    <option value="Large">{t.amountLarge}</option>
                </select>
            </div>

            <div className="form-group">
                <label>{t.notes}</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder={t.notesPlaceholder}
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-submit" style={{ flex: 1 }}>
                    {editingEntry ? 'Update Entry' : t.logEntry}
                </button>
                {editingEntry && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn"
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default TrackerForm;
