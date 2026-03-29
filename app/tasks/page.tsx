'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: '',
    task_type: '',
    due_date: '',
    employee_id: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [statusFilter, employeeFilter]);

  const fetchTasks = async () => {
    try {
      let url = '/api/tasks?';

      if (statusFilter) url += `status=${statusFilter}&`;
      if (employeeFilter) url += `employeeId=${employeeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data.data || []);
  };

  // ✅ CREATE
  const handleCreateTask = async () => {
    if (!form.title || !form.task_type || !form.due_date || !form.employee_id) {
      alert('Please fill all required fields ❌');
      return;
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error ❌');
      return;
    }

    alert('Task created ✅');

    setShowForm(false);
    setForm({
      title: '',
      description: '',
      priority: '',
      task_type: '',
      due_date: '',
      employee_id: '',
    });

    fetchTasks();
  };

  // ✅ DELETE (FIXED)
  const deleteTask = async (id: string) => {
    const res = await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) fetchTasks();
    else alert('Delete failed ❌');
  };

  // ✅ UPDATE (FIXED)
  const updateTask = async (id: string, status: string) => {
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) fetchTasks();
  };

  const getPriorityColor = (p?: string) => {
    if (p === 'HIGH') return 'bg-orange-100 text-orange-800';
    if (p === 'MEDIUM') return 'bg-yellow-100 text-yellow-800';
    if (p === 'LOW') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (s?: string) => {
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'in_progress') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 space-y-6 p-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage tasks</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Create Task</Button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {/* FORM */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            <input
              placeholder="Title"
              className="border p-2 w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="">Priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <select
              value={form.task_type}
              onChange={(e) => setForm({ ...form, task_type: e.target.value })}
            >
              <option value="">Task Type</option>
              <option value="IT_SETUP">IT_SETUP</option>
              <option value="HR_PAPERWORK">HR_PAPERWORK</option>
            </select>

            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />

            {/* EMPLOYEE */}
            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={handleCreateTask} className="bg-black text-white px-4 py-2">
                Submit
              </button>
              <button onClick={() => setShowForm(false)} className="border px-4 py-2">
                Cancel
              </button>
            </div>

          </CardContent>
        </Card>
      )}

      {/* TASK LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({tasks.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {tasks.map((task) => (
            <div key={task.id} className="border p-3 mb-3 rounded">

              <h3>{task.title}</h3>

              <div className="flex gap-2 mt-2">
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              </div>

              <div className="text-sm mt-1">
                Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
              </div>

              {/* ✅ FIXED UPDATE */}
              <select
                className="mt-2 border p-1"
                value={task.status}
                onChange={(e) => updateTask(String(task.id), e.target.value)}
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* ✅ FIXED DELETE */}
              <button
                onClick={() => deleteTask(String(task.id))}
                className="text-red-500 text-sm mt-2 ml-2"
              >
                Delete
              </button>

            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}