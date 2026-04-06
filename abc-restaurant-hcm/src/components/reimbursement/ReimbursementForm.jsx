import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const FALLBACK_CATEGORIES = ['Meals', 'Transportation', 'Supplies', 'Uniform', 'Training', 'Other'];

const ReimbursementForm = ({ isOpen, onClose, onAdd, categories = [] }) => {
  const today = new Date().toISOString().split('T')[0];
  const availableCategories = categories.length > 0
    ? categories.map((item) => item.category_name)
    : FALLBACK_CATEGORIES;

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: today,
    category: availableCategories.includes('Other') ? 'Other' : availableCategories[0] || 'Other',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: availableCategories.includes(prev.category)
        ? prev.category
        : (availableCategories.includes('Other') ? 'Other' : availableCategories[0] || 'Other'),
    }));
  }, [availableCategories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData({
      description: '',
      amount: '',
      date: today,
      category: availableCategories.includes('Other') ? 'Other' : availableCategories[0] || 'Other',
      notes: '',
    });
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      await onAdd({
        description: formData.description.trim(),
        amount,
        date: formData.date,
        category: formData.category,
        notes: formData.notes.trim() || null,
      });

      toast.success('Reimbursement request submitted!');
      handleClose();
    } catch (submitError) {
      setError(submitError.message || 'Failed to submit reimbursement request.');
    }
  };

  return (
    <div className="reimb-modal-overlay" onClick={handleClose}>
      <div className="card reimb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reimb-modal-header">
          <h2 className="reimb-modal-title">New Reimbursement Request</h2>
          <button type="button" className="reimb-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && <div className="reimb-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="reimb-form-group">
            <label className="reimb-form-label" htmlFor="reimb-description">
              Description *
            </label>
            <input
              id="reimb-description"
              type="text"
              name="description"
              className="reimb-form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Taxi fare to catering event"
              required
            />
          </div>

          <div className="reimb-form-row">
            <div>
              <label className="reimb-form-label" htmlFor="reimb-amount">
                Amount ($) *
              </label>
              <input
                id="reimb-amount"
                type="number"
                name="amount"
                className="reimb-form-input"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="reimb-form-label" htmlFor="reimb-date">
                Date *
              </label>
              <input
                id="reimb-date"
                type="date"
                name="date"
                className="reimb-form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="reimb-form-group">
            <label className="reimb-form-label" htmlFor="reimb-category">
              Category *
            </label>
            <select
              id="reimb-category"
              name="category"
              className="reimb-form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="reimb-form-group">
            <label className="reimb-form-label" htmlFor="reimb-notes">
              Notes (optional)
            </label>
            <textarea
              id="reimb-notes"
              name="notes"
              className="reimb-form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details or receipt references..."
              rows={3}
            />
          </div>

          <div className="reimb-form-actions">
            <button type="button" className="reimb-form-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="reimb-form-submit">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReimbursementForm;
