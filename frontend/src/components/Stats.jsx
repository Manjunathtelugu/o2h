import React from 'react';

export default function Stats({ stats }) {
  const { total = 0, pending = 0, inProgress = 0, completed = 0 } = stats || {};

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <div className="stats-icon-wrapper total">📋</div>
        <div className="stats-info">
          <span className="stats-val" id="stat-total">{total}</span>
          <span className="stats-label">Total Tasks</span>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-wrapper pending">⏳</div>
        <div className="stats-info">
          <span className="stats-val" id="stat-pending">{pending}</span>
          <span className="stats-label">Pending</span>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-wrapper total" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>⚙️</div>
        <div className="stats-info">
          <span className="stats-val" id="stat-progress">{inProgress}</span>
          <span className="stats-label">In Progress</span>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-wrapper completed">✅</div>
        <div className="stats-info">
          <span className="stats-val" id="stat-completed">{completed}</span>
          <span className="stats-label">Completed</span>
        </div>
      </div>
    </div>
  );
}
