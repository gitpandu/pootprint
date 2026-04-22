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

    const inputClasses = "py-2 px-3 border border-border rounded-none font-inherit text-[0.9rem] bg-card-bg text-text w-full box-border min-h-[40px] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
    const labelClasses = "block font-medium mb-1.5 text-[0.9rem] text-text";
    const btnClasses = "bg-primary text-bg border border-primary py-2 px-4 rounded-none font-medium cursor-pointer transition-all duration-200 text-[0.9rem] min-h-[40px] inline-flex items-center justify-center hover:bg-primary-dark hover:opacity-90";

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className={labelClasses}>{t.dateAndTime}</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="date"
                        required
                        className={inputClasses}
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                    <input
                        type="time"
                        required
                        className={inputClasses}
                        value={formData.time}
                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className={labelClasses}>{t.consistency}</label>
                <select
                    className={inputClasses}
                    value={formData.consistency}
                    onChange={e => setFormData({ ...formData, consistency: Number(e.target.value) })}
                >
                    {Object.entries(t.types).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className={labelClasses}>{t.amount}</label>
                <select
                    className={inputClasses}
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                >
                    <option value="">{t.selectAmount}</option>
                    <option value="Small">{t.amountSmall}</option>
                    <option value="Normal">{t.amountNormal}</option>
                    <option value="Large">{t.amountLarge}</option>
                </select>
            </div>

            <div className="mb-4">
                <label className={labelClasses}>{t.notes}</label>
                <input
                    type="text"
                    className={inputClasses}
                    placeholder={t.notesPlaceholder}
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                />
            </div>

            <div className="flex gap-2 mt-2">
                <button type="submit" className={`${btnClasses} flex-1`}>
                    {editingEntry ? 'Update Entry' : t.logEntry}
                </button>
                {editingEntry && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-transparent text-text border border-border py-2 px-4 rounded-none font-medium cursor-pointer transition-all duration-200 text-[0.9rem] min-h-[40px] inline-flex items-center justify-center hover:bg-border"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default TrackerForm;
