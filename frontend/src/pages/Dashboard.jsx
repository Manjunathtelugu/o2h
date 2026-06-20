import React, { useEffect, useState, useCallback } from 'react';
import Stats from '../components/Stats';
import TaskCard from '../components/TaskCard';
import { taskService } from '../services/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Toast / Feedback message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        taskService.getTasks({
          status: statusFilter,
          search: searchQuery,
          sortBy,
          page: currentPage,
          limit: 6
        }),
        taskService.getStats()
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
        if (tasksRes.pagination) {
          setTotalPages(tasksRes.pagination.totalPages || 1);
          setTotalTasks(tasksRes.pagination.totalTasks || 0);
        }
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to sync tasks with database', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filter criteria changes
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Update task status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await taskService.updateTaskStatus(id, newStatus);
      if (res.success) {
        showToast(`Task status set to "${newStatus}"`);
        fetchData();
      }
    } catch (err) {
      console.error('Status Update Error:', err);
      showToast('Failed to update task status', 'error');
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      const res = await taskService.deleteTask(id);
      if (res.success) {
        showToast('Task deleted successfully');
        // Handle offset bounds on page reduction
        if (tasks.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      }
    } catch (err) {
      console.error('Deletion Error:', err);
      showToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`notification ${toast.type}`}>
          <span>{toast.type === 'success' ? '✨' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2>Task Dashboard</h2>
          <span className="page-subtitle">Track and organize project milestones</span>
        </div>
      </div>

      {/* Statistics */}
      <Stats stats={stats} />

      {/* Filter and Control Bar */}
      <div className="controls-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-actions">
          <select 
            className="select-control"
            value={statusFilter}
            onChange={handleFilterChange}
            id="statusFilterSelect"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            className="select-control"
            value={sortBy}
            onChange={handleSortChange}
            id="sortOrderSelect"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Tasks Content */}
      {loading ? (
        <div className="spinner" id="loadingIndicator"></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state" id="emptyStateContainer">
          <div className="empty-state-icon">📂</div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-desc">
            {searchQuery || statusFilter 
              ? "No tasks match your filter criteria. Try expanding your search scope." 
              : "Your portal is empty! Get started by adding a task."}
          </p>
        </div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                ◀ Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages} ({totalTasks} total)
              </span>
              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
