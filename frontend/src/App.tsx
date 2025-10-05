import axios from 'axios'
import { useRef, useState, useEffect } from 'react'

interface Todo {
  id: number
  task: string
  is_done: boolean
  date?: string
  attachment?: File | string
  pic?: string
}

function App() {

  useEffect(() => {
    getTasks();
  ;}, [])

  const [todos, setTodos] = useState<Todo[]>([])
  const [task, setTask] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editTaskText, setEditTaskText] = useState('')
  const [editTaskDate, setEditTaskDate] = useState('')
  const [editTaskFile, setEditTaskFile] = useState<File | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isPosting, setIsPosting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filter])

  const filteredTodos = todos.filter(todo => {
    // Search filter
    const matchesSearch = todo.task.toLowerCase().includes(searchTerm.toLowerCase())
    // Status filter
    let matchesFilter = true
    if (filter === 'active') matchesFilter = !todo.is_done
    if (filter === 'completed') matchesFilter = todo.is_done
    
    return matchesSearch && matchesFilter
  })

  // Pagination (3 items per page)
  const ITEMS_PER_PAGE = 3
  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / ITEMS_PER_PAGE))
  const clampedPage = Math.min(currentPage, totalPages)
  const startIndex = (clampedPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex)

  const getTasks = async () => {
    await axios.get('http://127.0.0.1:8000/tasks').then((res) => {
      setTodos(res.data)
    })
  }

  const postTask = async () => {
    if (task.trim() !== '') {
      try {
        setIsPosting(true);
        let imageUrl = null;
  
        // Upload image if there is one
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile); // Filename
  
          const uploadRes = await axios.post(
            "http://127.0.0.1:8000/upload",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
  
          imageUrl = uploadRes.data.url; // URL from Cloudinary
        }
  
        // Create task with URL of the image
        const newTask = {
          task,
          is_done: false,
          date: selectedDate || null,
          pic: imageUrl, // Save URL of the image
        };
  
        // Post task to backend
        await axios.post( "http://127.0.0.1:8000/tasks", newTask).then(() => {
          getTasks();
        });
      } catch (error) {
        console.error("Error posting task:", error);
      } finally {
        setTask("");
        setSelectedDate("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsPosting(false);
      }
    }
  };

  const deleteTask = async (id: number) => {
    await axios.delete("http://127.0.0.1:8000/tasks/" + id).then(() => {
      getTasks();
    })
  }

  const updateTask = async (id: number) => {
    try {
      const task = todos.find((t) => t.id === id);
      if (!task) return;
  
      const taskData = {
        ...task,
        is_done: !task.is_done,
      };
  
      await axios.put(`http://127.0.0.1:8000/tasks/${id}`, taskData);
  
      getTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Edit modal functions
  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTaskText(todo.task);
    setEditTaskDate(todo.date || '');
    setEditTaskFile(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTodo(null);
    setEditTaskText('');
    setEditTaskDate('');
    setEditTaskFile(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const saveEditedTask = async () => {
    if (!editingTodo || editTaskText.trim() === '') {
      alert("Please enter a task");
      return;
    }

    try {
      setIsUpdating(true);
      let imageUrl = editingTodo.pic; // Keep existing image by default

      // Upload new image if there is one
      if (editTaskFile) {
        const formData = new FormData();
        formData.append("file", editTaskFile);

        const uploadRes = await axios.post(
          "http://127.0.0.1:8000/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        imageUrl = uploadRes.data.url;
      }

      // Update task data
      const updatedTaskData = {
        ...editingTodo,
        task: editTaskText.trim(),
        date: editTaskDate || null,
        pic: imageUrl,
      };

      // Update task in backend
      await axios.put(`http://127.0.0.1:8000/tasks/${editingTodo.id}`, updatedTaskData);

      // Refresh tasks and close modal
      getTasks();
      closeEditModal();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" style={{width: '100%', maxWidth: '28rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', boxSizing: 'border-box'}}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2" style={{fontSize: '1.875rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem'}}>
            ✨ Todo List
          </h1>
          <p className="text-gray-500 text-sm" style={{color: '#6b7280', fontSize: '0.875rem'}}>
            Stay organized and productive
          </p>
        </div>

        {/* Search Bar and Filter */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your todos..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                style={{paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', backgroundColor: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxSizing: 'border-box'}}
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg"
                style={{padding: '0.75rem 1rem', marginLeft: '0.4rem', background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)', minWidth: '140px'}}
              >
                <option value="all">📋 All Tasks</option>
                <option value="active">⏳ Active</option>
                <option value="completed">✅ Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Todo Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6" style={{background: 'linear-gradient(90deg, #faf5ff 0%, #eff6ff 100%)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem'}}>
          <div className="space-y-5">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="✨ What needs to be done?"
              className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              style={{padding: '0.75rem 1rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxSizing: 'border-box'}}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{padding: '0.5rem 0.75rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxSizing: 'border-box'}}
            />
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              ref={fileInputRef}
              accept="image/*, .pdf, .docx, .xlsx"
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:mr-2"
              style={{padding: '0.5rem 0.75rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxSizing: 'border-box'}}
            />
            <button
              onClick={postTask}
              disabled={task.trim() === '' || isPosting}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{padding: '0.75rem 1rem', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'}}
            >
              {isPosting ? 'Posting…' : '🚀 Add Task'}
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3 flex flex-col">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-2" style={{color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem'}}>
                {todos.length === 0 ? 'No tasks yet!' : 'No tasks match your search.'}
              </p>
              <p className="text-gray-400 text-sm" style={{color: '#9ca3af', fontSize: '0.875rem'}}>
                {todos.length === 0 ? 'Add your first task above to get started!' : 'Try adjusting your search or filter.'}
              </p>
            </div>
          ) : (
            paginatedTodos.map(todo => (
              <div
                key={todo.id}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                  todo.is_done 
                    ? 'bg-gray-50' 
                    : 'bg-white'
                }`}
                style={{
                  backgroundColor: todo.is_done ? '#f9fafb' : 'white',
                  border: `1px solid ${todo.is_done ? '#e5e7eb' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.is_done}
                  onChange={() => updateTask(todo.id)}
                  className={`w-5 h-5 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    todo.is_done ? 'text-purple-600' : 'text-gray-400'
                  }`}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: todo.is_done ? '#7c3aed' : '#9ca3af',
                    borderRadius: '0.5rem'
                  }}
                />
                  <>
                    <span
                      className={`flex-1 ${
                        todo.is_done 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}
                      style={{
                        flex: 1,
                        color: todo.is_done ? '#6b7280' : '#1f2937',
                        textDecoration: todo.is_done ? 'line-through' : 'none',
                        fontSize: '1rem'
                      }}
                    >
                      {todo.task}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openEditModal(todo)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                        style={{padding: '0.25rem 0.75rem', color: '#2563eb', backgroundColor: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem'}}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteTask(todo.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        style={{padding: '0.25rem 0.75rem', color: '#dc2626', backgroundColor: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredTodos.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={clampedPage === 1}
              className="mt-2 px-4 py-3 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', color: 'white'}}
            >
              ← Prev
            </button>
            <div className="text-sm text-gray-500">
              Page {clampedPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={clampedPage === totalPages}
              className="mt-2 px-4 py-3 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', color: 'white'}}
            >
              Next →
            </button>
          </div>
        )}

        {filteredTodos.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4" style={{marginTop: '1.5rem', background: 'linear-gradient(90deg, #faf5ff 0%, #eff6ff 100%)', borderRadius: '0.75rem', padding: '1rem'}}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600" style={{fontSize: '0.875rem', color: '#4b5563'}}>
                Progress
              </div>
              <div className="text-sm font-semibold text-purple-600" style={{fontSize: '0.875rem', fontWeight: '600', color: '#7c3aed'}}>
                {filteredTodos.filter(todo => todo.is_done
                ).length} / {filteredTodos.length}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2" style={{marginTop: '0.5rem', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem'}}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  width: `${filteredTodos.length > 0 ? (filteredTodos.filter(todo => todo.is_done
                  ).length / filteredTodos.length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}
          onClick={closeEditModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '28rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ✏️ Edit Task
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ color: '#9ca3af', cursor: 'pointer' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              {/* Task Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </label>
                <input
                  type="text"
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value)}
                  placeholder="Enter task description..."
                  className="w-full px-4 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editTaskDate}
                  onChange={(e) => setEditTaskDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditTaskFile(e.target.files?.[0] || null)}
                  ref={editFileInputRef}
                  accept="image/*, .pdf, .docx, .xlsx"
                  className="w-full px-4 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:text-sm transition-all duration-200"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box'
                  }}
                />
                {editingTodo?.pic && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-2">Current attachment:</div>
                    <div className="w-full max-h-48 overflow-hidden rounded border bg-gray-50 flex items-center justify-center">
                      {(() => {
                        const url = editingTodo.pic as string;
                        const isPdf = url.toLowerCase().endsWith('.pdf');
                        const previewUrl = isPdf
                          ? url.replace('/upload/', '/upload/w_600,h_400,pg_1,f_auto/')
                          : url.replace('/upload/', '/upload/w_600,h_400,f_auto/');
                        return (
                            <img
                              src={previewUrl}
                              alt={isPdf ? 'PDF preview (click to open)' : 'Attachment preview (click to open)'}
                              className="max-w-full max-h-48 object-contain"
                              style={{display: 'block'}}
                            />
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedTask}
                  disabled={editTaskText.trim() === '' || isUpdating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {isUpdating ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App