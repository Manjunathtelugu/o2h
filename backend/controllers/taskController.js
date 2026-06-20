const taskModel = require('../models/taskModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
async function createTask(req, res) {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 20 characters long'
      });
    }

    // Validate status values
    const allowedStatuses = ['Pending', 'In Progress'];
    let taskStatus = 'Pending';
    if (status && allowedStatuses.includes(status)) {
      taskStatus = status;
    }

    const newTask = await taskModel.createTask(title, description, taskStatus, userId);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating task',
      error: error.message
    });
  }
}

// @desc    Get all tasks with filters, search, sorting, and pagination
// @route   GET /api/tasks
// @access  Private
async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    
    // Filters & Pagination query parameters
    const status = req.query.status || '';
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'newest'; // newest or oldest
    
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '6');
    const offset = (page - 1) * limit;

    // Fetch tasks & total count for pagination
    const [tasks, totalTasks] = await Promise.all([
      taskModel.getTasks({ userId, status, search, sortBy, limit, offset }),
      taskModel.countTasks({ userId, status, search })
    ]);

    const totalPages = Math.ceil(totalTasks / limit);

    return res.json({
      success: true,
      data: tasks,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching tasks',
      error: error.message
    });
  }
}

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
async function updateTaskStatus(req, res) {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status value is required'
      });
    }

    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const isUpdated = await taskModel.updateTaskStatus(taskId, status, userId);
    if (!isUpdated) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized to update'
      });
    }

    return res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { id: taskId, status }
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating task',
      error: error.message
    });
  }
}

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const isDeleted = await taskModel.deleteTask(taskId, userId);
    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized to delete'
      });
    }

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting task',
      error: error.message
    });
  }
}

// @desc    Get dashboard metrics & stats
// @route   GET /api/tasks/stats
// @access  Private
async function getStats(req, res) {
  try {
    const userId = req.user.id;
    const stats = await taskModel.getDashboardStats(userId);
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching task statistics',
      error: error.message
    });
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
  getStats
};
