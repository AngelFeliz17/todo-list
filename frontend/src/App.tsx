import { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
  date?: string
  attachment?: File | string
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        date: selectedDate,
        attachment: selectedFile ?? undefined
      }
      setTodos([...todos, newTodo])
      setInputValue('')
      setSelectedDate('')
      setSelectedFile(null)
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEdit = (id: number, currentText: string) => {
    setEditingId(id)
    setEditText(currentText)
  }

  const saveEdit = () => {
    if (editText.trim() !== '') {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ))
      setEditingId(null)
      setEditText('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const filteredTodos = todos.filter(todo => {
    // Search filter
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    let matchesFilter = true
    if (filter === 'active') matchesFilter = !todo.completed
    if (filter === 'completed') matchesFilter = todo.completed
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" style={{width: '100%', maxWidth: '28rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '2rem'}}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2" style={{fontSize: '1.875rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem'}}>
            ✨ Todo List
          </h1>
          <p className="text-gray-500 text-sm" style={{color: '#6b7280', fontSize: '0.875rem'}}>
            Stay organized and productive
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
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
              style={{width: '100%', paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', backgroundColor: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.75rem'}}
            />
          </div>
        </div>

        {/* Filter and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg"
              style={{padding: '0.5rem 1rem', background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', borderRadius: '0.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'}}
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
          
          <div className="text-sm text-gray-500" style={{fontSize: '0.875rem', color: '#6b7280'}}>
            {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        
        {/* Add Todo Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6" style={{background: 'linear-gradient(90deg, #faf5ff 0%, #eff6ff 100%)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem'}}>
        <div className="space-y-3 flex flex-col">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="✨ What needs to be done?"
              className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              style={{width: '100%', padding: '0.75rem 1rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}}
            />
             <div className="flex flex-col gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{flex: 1, padding: '0.5rem 0.75rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}}
              />
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept="image/*"
                className="flex-1 px-3 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:mr-2"
                style={{flex: 1, padding: '0.5rem 0.75rem', backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}}
              />
            </div>
            <button
              onClick={addTodo}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
              style={{width: '100%', padding: '0.75rem 1rem', background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'}}
            >
              🚀 Add Task
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
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  todo.completed 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
                style={{
                  backgroundColor: todo.completed ? '#f9fafb' : 'white',
                  border: `1px solid ${todo.completed ? '#e5e7eb' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    todo.completed ? 'text-purple-600' : 'text-gray-400'
                  }`}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: todo.completed ? '#7c3aed' : '#9ca3af',
                    borderRadius: '0.5rem'
                  }}
                />
                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.875rem', backgroundColor: '#374151', color: 'white', border: '1px solid #6b7280', borderRadius: '0.25rem'}}
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="px-2 py-1 text-green-400 hover:bg-green-900 rounded transition-colors"
                      style={{padding: '0.25rem 0.5rem', color: '#4ade80', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 text-gray-400 hover:bg-gray-700 rounded transition-colors"
                      style={{padding: '0.25rem 0.5rem', color: '#9ca3af', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className={`flex-1 ${
                        todo.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}
                      style={{
                        flex: 1,
                        color: todo.completed ? '#6b7280' : '#1f2937',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        fontSize: '1rem'
                      }}
                    >
                      {todo.text}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startEdit(todo.id, todo.text)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                        style={{padding: '0.25rem 0.75rem', color: '#2563eb', backgroundColor: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem'}}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        style={{padding: '0.25rem 0.75rem', color: '#dc2626', backgroundColor: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {filteredTodos.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4" style={{marginTop: '1.5rem', background: 'linear-gradient(90deg, #faf5ff 0%, #eff6ff 100%)', borderRadius: '0.75rem', padding: '1rem'}}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600" style={{fontSize: '0.875rem', color: '#4b5563'}}>
                Progress
              </div>
              <div className="text-sm font-semibold text-purple-600" style={{fontSize: '0.875rem', fontWeight: '600', color: '#7c3aed'}}>
                {filteredTodos.filter(todo => todo.completed).length} / {filteredTodos.length}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2" style={{marginTop: '0.5rem', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem'}}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  width: `${filteredTodos.length > 0 ? (filteredTodos.filter(todo => todo.completed).length / filteredTodos.length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App