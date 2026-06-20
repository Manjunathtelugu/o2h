import React from 'react';

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const { id, title, description, status, created_at, completed_at } = task;

  // Format created date
  const formatDate = (dateString) => {
    try {
      let formattedString = dateString;
      if (typeof dateString === 'string') {
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('GMT')) {
          formattedString = dateString.replace(' ', 'T') + 'Z';
        }
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(formattedString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'Completed': return 'badge completed';
      case 'In Progress': return 'badge in-progress';
      case 'Pending':
      default:
        return 'badge pending';
    }
  };

  return (
    <div className="task-card" id={`task-card-${id}`}>
      <div>
        <div className="task-badge-row">
          <span className={getStatusBadgeClass(status)}>{status}</span>
          <span className="task-date">
            {status === 'Completed' && completed_at
              ? `Completed: ${formatDate(completed_at)}`
              : `Created: ${formatDate(created_at)}`}
          </span>
        </div>
        <h3 className="task-title">{title}</h3>
        <p className="task-desc">{description}</p>
      </div>

      <div className="task-actions">
        {status === 'Pending' && (
          <button 
            className="btn btn-secondary" 
            onClick={() => onStatusChange(id, 'In Progress')}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            Start Task
          </button>
        )}
        
        {status !== 'Completed' && (
          <button 
            className="btn btn-success" 
            onClick={() => onStatusChange(id, 'Completed')}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            Complete
          </button>
        )}

        <button 
          className="btn btn-danger" 
          onClick={() => onDelete(id)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          title="Delete Task"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
