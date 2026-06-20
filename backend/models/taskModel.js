const db = require('../config/db');

async function createTask(title, description, status, userId) {
  const sql = `
    INSERT INTO Tasks (title, description, status, user_id)
    VALUES (?, ?, ?, ?)
  `;
  const result = await db.query(sql, [title, description, status || 'Pending', userId]);
  return {
    id: result.insertId,
    title,
    description,
    status: status || 'Pending',
    user_id: userId,
    created_at: new Date()
  };
}

async function getTasks({ userId, status, search, sortBy, limit, offset }) {
  let sql = `SELECT * FROM Tasks WHERE user_id = ?`;
  const params = [userId];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    const searchWildcard = `%${search}%`;
    params.push(searchWildcard, searchWildcard);
  }

  // Sorting
  if (sortBy === 'oldest') {
    sql += ` ORDER BY created_at ASC`;
  } else {
    // Default to newest first
    sql += ` ORDER BY created_at DESC`;
  }

  // Pagination
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return await db.query(sql, params);
}

async function countTasks({ userId, status, search }) {
  let sql = `SELECT COUNT(*) as count FROM Tasks WHERE user_id = ?`;
  const params = [userId];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    const searchWildcard = `%${search}%`;
    params.push(searchWildcard, searchWildcard);
  }

  const results = await db.query(sql, params);
  
  // Normalize the returned count from SQLite (which might be count) or MySQL (which might be COUNT(*))
  if (results && results.length > 0) {
    const key = Object.keys(results[0])[0];
    return parseInt(results[0][key] || '0');
  }
  return 0;
}

async function updateTaskStatus(taskId, status, userId) {
  let sql;
  let params;
  if (status === 'Completed') {
    sql = `
      UPDATE Tasks
      SET status = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    params = [status, taskId, userId];
  } else {
    sql = `
      UPDATE Tasks
      SET status = ?, completed_at = NULL
      WHERE id = ? AND user_id = ?
    `;
    params = [status, taskId, userId];
  }
  const result = await db.query(sql, params);
  return result.affectedRows > 0;
}

async function deleteTask(taskId, userId) {
  const sql = `
    DELETE FROM Tasks
    WHERE id = ? AND user_id = ?
  `;
  const result = await db.query(sql, [taskId, userId]);
  return result.affectedRows > 0;
}

async function getDashboardStats(userId) {
  // Let's run count queries for total, pending, in progress, and completed
  const totalSql = `SELECT COUNT(*) as count FROM Tasks WHERE user_id = ?`;
  const pendingSql = `SELECT COUNT(*) as count FROM Tasks WHERE user_id = ? AND status = 'Pending'`;
  const inProgressSql = `SELECT COUNT(*) as count FROM Tasks WHERE user_id = ? AND status = 'In Progress'`;
  const completedSql = `SELECT COUNT(*) as count FROM Tasks WHERE user_id = ? AND status = 'Completed'`;

  const [totalRes, pendingRes, inProgressRes, completedRes] = await Promise.all([
    db.query(totalSql, [userId]),
    db.query(pendingSql, [userId]),
    db.query(inProgressSql, [userId]),
    db.query(completedSql, [userId])
  ]);

  return {
    total: totalRes[0] ? parseInt(Object.values(totalRes[0])[0] || '0') : 0,
    pending: pendingRes[0] ? parseInt(Object.values(pendingRes[0])[0] || '0') : 0,
    inProgress: inProgressRes[0] ? parseInt(Object.values(inProgressRes[0])[0] || '0') : 0,
    completed: completedRes[0] ? parseInt(Object.values(completedRes[0])[0] || '0') : 0
  };
}

module.exports = {
  createTask,
  getTasks,
  countTasks,
  updateTaskStatus,
  deleteTask,
  getDashboardStats
};
