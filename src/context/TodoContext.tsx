import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Session {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

interface Tag {
  id: string;
  name: string;
  color: string; // hex color
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  totalTime: number; // in seconds
  sessions: Session[];
  tagId?: string;
}

interface TodoContextType {
  todos: Todo[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  addTodo: (text: string, tagId?: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, text: string) => Promise<void>;
  updateTodoTag: (todoId: string, tagId: string | undefined) => Promise<void>;
  addSessionToTodo: (todoId: string, session: Session) => Promise<void>;
  getTodo: (id: string) => Todo | undefined;
  addTag: (name: string, color: string) => Promise<void>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent flash
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      setLoading(true);
      loadData();
      setupRealtimeSubscriptions();
    }

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        if (hasInitialized) {
          loadData();
        }
      } else {
        setUserId(null);
        setTodos([]);
        setTags([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [hasInitialized]);

  const setupRealtimeSubscriptions = () => {
    // Set up real-time subscriptions for todos
    const channel = supabase
      .channel('todo-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          handleRealtimeUpdate('todos', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tags' },
        (payload) => {
          handleRealtimeUpdate('tags', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          handleRealtimeUpdate('sessions', payload);
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const handleRealtimeUpdate = (table: string, payload: any) => {
    if (table === 'todos') {
      if (payload.eventType === 'INSERT') {
        loadData(); // Reload to get sessions
      } else if (payload.eventType === 'UPDATE') {
        setTodos(prev => prev.map(todo => 
          todo.id === payload.new.id 
            ? { ...todo, text: payload.new.text, completed: payload.new.completed, totalTime: payload.new.total_time, tagId: payload.new.tag_id }
            : todo
        ));
      } else if (payload.eventType === 'DELETE') {
        setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
      }
    } else if (table === 'tags') {
      if (payload.eventType === 'INSERT') {
        const newTag: Tag = {
          id: payload.new.id,
          name: payload.new.name,
          color: payload.new.color
        };
        setTags(prev => [...prev, newTag]);
      } else if (payload.eventType === 'UPDATE') {
        setTags(prev => prev.map(tag => 
          tag.id === payload.new.id 
            ? { ...tag, name: payload.new.name, color: payload.new.color }
            : tag
        ));
      } else if (payload.eventType === 'DELETE') {
        setTags(prev => prev.filter(tag => tag.id !== payload.old.id));
      }
    } else if (table === 'sessions') {
      // Reload todos to get updated sessions
      loadData();
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tagsError) throw tagsError;

      // Load todos
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;

      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (sessionsError) throw sessionsError;

      // Map the data to our format
      const mappedTags: Tag[] = tagsData?.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })) || [];

      // Group sessions by todo_id
      const sessionsByTodoId: Record<string, Session[]> = {};
      sessionsData?.forEach(session => {
        if (!sessionsByTodoId[session.todo_id]) {
          sessionsByTodoId[session.todo_id] = [];
        }
        sessionsByTodoId[session.todo_id].push({
          id: session.id,
          startTime: new Date(session.start_time),
          endTime: new Date(session.end_time),
          duration: session.duration
        });
      });

      const mappedTodos: Todo[] = todosData?.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        totalTime: todo.total_time,
        tagId: todo.tag_id || undefined,
        sessions: sessionsByTodoId[todo.id] || []
      })) || [];

      // If no tags exist, create default ones
      if (mappedTags.length === 0) {
        const defaultTags = [
          { name: 'School Work', color: '#3B82F6' },
          { name: 'Business', color: '#10B981' },
          { name: 'Personal', color: '#F59E0B' },
          { name: 'Health', color: '#EF4444' },
          { name: 'Learning', color: '#8B5CF6' }
        ];

        for (const tag of defaultTags) {
          const { data, error } = await supabase
            .from('tags')
            .insert([{ ...tag, user_id: user.id }])
            .select()
            .single();
          
          if (!error && data) {
            mappedTags.push({
              id: data.id,
              name: data.name,
              color: data.color
            });
          }
        }
      }

      setTags(mappedTags);
      setTodos(mappedTodos);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string, tagId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        text,
        completed: false,
        total_time: 0,
        tag_id: tagId || null,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    const newTodo: Todo = {
      id: data.id,
      text: data.text,
      completed: data.completed,
      totalTime: data.total_time,
      tagId: data.tag_id || undefined,
      sessions: []
    };

    setTodos([...todos, newTodo]);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) throw error;
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const updateTodo = async (id: string, text: string) => {
    const { error } = await supabase
      .from('todos')
      .update({ text })
      .eq('id', id);

    if (error) throw error;
  };

  const updateTodoTag = async (todoId: string, tagId: string | undefined) => {
    const { error } = await supabase
      .from('todos')
      .update({ tag_id: tagId || null })
      .eq('id', todoId);

    if (error) throw error;
  };

  const addSessionToTodo = async (todoId: string, session: Session) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Insert session into database
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        todo_id: todoId,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime.toISOString(),
        duration: session.duration,
        user_id: user.id
      }])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Update todo's total time
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const newTotalTime = todo.totalTime + session.duration;
    
    const { error: todoError } = await supabase
      .from('todos')
      .update({ total_time: newTotalTime })
      .eq('id', todoId);

    if (todoError) throw todoError;
  };

  const getTodo = (id: string) => {
    return todos.find(todo => todo.id === id);
  };

  const addTag = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tags')
      .insert([{ name, color, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
  };

  const updateTag = async (id: string, name: string, color: string) => {
    const { error } = await supabase
      .from('tags')
      .update({ name, color })
      .eq('id', id);

    if (error) throw error;
  };

  const deleteTag = async (id: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return (
    <TodoContext.Provider value={{
      todos,
      tags,
      loading,
      error,
      userId,
      addTodo,
      toggleTodo,
      deleteTodo,
      updateTodo,
      updateTodoTag,
      addSessionToTodo,
      getTodo,
      addTag,
      updateTag,
      deleteTag
    }}>
      {children}
    </TodoContext.Provider>
  );
};