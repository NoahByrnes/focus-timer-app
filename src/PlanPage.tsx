import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Clock, ChevronDown, ChevronUp, Tag, Settings } from 'lucide-react';
import { useTodos } from './context/TodoContext';
import { TagSelector } from './components/TagSelector';

const PlanPage = () => {
  const { todos, tags, loading, addTodo, toggleTodo, deleteTodo, updateTodo, updateTodoTag, addTag, deleteTag } = useTodos();
  const [newTodo, setNewTodo] = useState('');
  const [newTodoTagId, setNewTodoTagId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      try {
        await addTodo(newTodo, newTodoTagId || undefined);
        setNewTodo('');
        setNewTodoTagId('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async () => {
    if (editingId && editText.trim()) {
      try {
        await updateTodo(editingId, editText);
        setEditingId(null);
        setEditText('');
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      try {
        await addTag(newTagName, newTagColor);
        setNewTagName('');
        setNewTagColor('#3B82F6');
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  // Only show loading on initial load, not on every re-render
  if (loading && todos.length === 0 && tags.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Todo List</h1>
            <p className="text-gray-600 dark:text-gray-400">Plan your day and track your tasks</p>
          </div>
          <button
            onClick={() => setShowTagManager(!showTagManager)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg  flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Manage Tags</span>
          </button>
        </div>

        {/* Add Todo */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-40">
              <TagSelector
                tags={tags}
                value={newTodoTagId}
                onChange={setNewTodoTagId}
                placeholder="No tag"
              />
            </div>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleAddTodo}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg "
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-4 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-1 text-sm font-medium  ${
              filter === 'all' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-1 text-sm font-medium  ${
              filter === 'active' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-1 text-sm font-medium  ${
              filter === 'completed' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <span className="ml-auto text-sm text-gray-500">
            Count: {filteredTodos.length}
          </span>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <Check className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No tasks</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'completed' ? 'No completed tasks yet' : 'All caught up!'}
              </p>
            </div>
          ) : (
            <>
              {/* Active Tasks */}
              {filter !== 'completed' && activeTodos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Tasks</h3>
                  <div className="space-y-2">
                    {activeTodos.map(todo => (
                      <div key={todo.id}>
                        <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm">
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 "
                          />
                          {editingId === todo.id ? (
                            <>
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                autoFocus
                              />
                              <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-gray-900">{todo.text}</span>
                              {todo.tagId && (() => {
                                const tag = tags.find(t => t.id === todo.tagId);
                                return tag ? (
                                  <div 
                                    className="px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span>{tag.name}</span>
                                  </div>
                                ) : null;
                              })()}
                              {!editingTagId && (
                                <button
                                  onClick={() => setEditingTagId(todo.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Tag className="w-4 h-4" />
                                </button>
                              )}
                              {editingTagId === todo.id && (
                                <select
                                  value={todo.tagId || ''}
                                  onChange={(e) => {
                                    updateTodoTag(todo.id, e.target.value || undefined);
                                    setEditingTagId(null);
                                  }}
                                  onBlur={() => setEditingTagId(null)}
                                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  autoFocus
                                >
                                  <option value="">No tag</option>
                                  {tags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                      {tag.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {todo.totalTime > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(todo.totalTime)}</span>
                                </div>
                              )}
                              {todo.sessions && todo.sessions.length > 0 && (
                                <button
                                  onClick={() => setExpandedTodoId(expandedTodoId === todo.id ? null : todo.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  {expandedTodoId === todo.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(todo.id, todo.text)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Session History */}
                        {expandedTodoId === todo.id && todo.sessions && todo.sessions.length > 0 && (
                          <div className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-600 mb-2">Focus Sessions</h4>
                            <div className="space-y-1">
                              {todo.sessions.map((session, index) => (
                                <div key={session.id} className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Session {index + 1}</span>
                                  <span>{formatDateTime(session.startTime)}</span>
                                  <span className="font-medium">{formatTime(session.duration)}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold text-gray-700">
                                <span>Total</span>
                                <span>{formatTime(todo.totalTime)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {filter !== 'active' && completedTodos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Completed Tasks</h3>
                  <div className="space-y-2">
                    {completedTodos.map(todo => (
                      <div key={todo.id} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="w-5 h-5 bg-green-500 border-2 border-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <span className="flex-1 line-through text-gray-500">{todo.text}</span>
                        {todo.tagId && (() => {
                          const tag = tags.find(t => t.id === todo.tagId);
                          return tag ? (
                            <div 
                              className="px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 opacity-60"
                              style={{ backgroundColor: tag.color }}
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag.name}</span>
                            </div>
                          ) : null;
                        })()}
                        {todo.totalTime > 0 && (
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(todo.totalTime)}</span>
                          </div>
                        )}
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tag Manager Modal */}
        {showTagManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Manage Tags</h2>
                <button
                  onClick={() => setShowTagManager(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Add New Tag */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="New tag name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Existing Tags */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-gray-900">{tag.name}</span>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPage;