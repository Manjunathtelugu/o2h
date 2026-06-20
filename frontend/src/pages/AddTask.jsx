import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';

export default function AddTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const tempErrors = {};
    if (!title || !title.trim()) {
      tempErrors.title = 'Task title is required';
    }
    if (!description || description.trim().length < 20) {
      tempErrors.description = 'Description must be at least 20 characters long';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await taskService.createTask(title, description, status);
      setLoading(false);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Server error creating task.';
      setServerError(errMsg);
    }
  };

  return (
    <div className="app-container">
      <div className="form-card">
        <h2 style={{ marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Create New Task</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Assign tasks to your board with description guidelines
        </p>

        <form onSubmit={handleSubmit} id="addTaskForm">
          {serverError && (
            <div className="form-error" style={{ marginBottom: '1.5rem', padding: '0.5rem', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-sm)' }}>
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">Task Title *</label>
            <input
              type="text"
              id="taskTitle"
              className="form-input"
              placeholder="e.g. Implement User Authentication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="form-error" id="titleError">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDesc">Description * (Minimum 20 characters)</label>
            <textarea
              id="taskDesc"
              className="form-input"
              rows="5"
              placeholder="Provide key details, acceptance criteria, or checklist steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            {errors.description && <span className="form-error" id="descriptionError">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskStatus">Initial Status</label>
            <select
              id="taskStatus"
              className="select-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submitTaskBtn"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
