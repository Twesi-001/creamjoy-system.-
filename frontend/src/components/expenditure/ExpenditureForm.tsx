import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenditureAPI, StaffAPI } from '../../api/api';
import './ExpenditureForm.css';

const ExpenditureForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        quantity: 0,
        unit: '',
        amount_ugx: 0,
        paid_by: 0,
        expenditure_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const categories = [
        'Milk', 'Milk Powder', 'Sugar', 'Starch', 'Bushela', 'Stabilizer',
        'Culture', 'Matapolo', 'Vanilla Essence', 'Bottles 1L', 'Bottles 300ml',
        'Stickers', 'Tencan', 'Transport', 'Uniform Washing', 'Allowance', 'Ice', 'Other'
    ];

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await StaffAPI.getAll();
            setStaff(response.data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await ExpenditureAPI.create(formData);
            navigate('/');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error recording expenditure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="expenditure-form">
            <div className="page-header">
                <h1>Record Expenditure</h1>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date *</label>
                        <input
                            type="date"
                            name="expenditure_date"
                            value={formData.expenditure_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., 3kg milk powder from Kabalagala"
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Unit *</label>
                        <input
                            type="text"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            placeholder="e.g., kg, litres, dozens"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount (UGX) *</label>
                        <input
                            type="number"
                            name="amount_ugx"
                            value={formData.amount_ugx}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="100"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Paid By</label>
                        <select
                            name="paid_by"
                            value={formData.paid_by}
                            onChange={handleChange}
                        >
                            <option value={0}>Select Staff</option>
                            {staff.map((s) => (
                                <option key={s.staff_id} value={s.staff_id}>
                                    {s.name} ({s.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Expenditure'}
                </button>
            </form>
        </div>
    );
};

export default ExpenditureForm;