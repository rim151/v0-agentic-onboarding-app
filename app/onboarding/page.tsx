'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OnboardingTask {
  id: number;
  employee_id: number;
  title: string;
  task_type: string;
  status: string;
  priority: string;
  due_date: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  onboarding_status: string;
}

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTasks(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      const emps = data.data || [];
      setEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmployee(emps[0]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (employeeId: number) => {
    try {
      const res = await fetch(`/api/tasks?employeeId=${employeeId}`);
      const data = await res.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      // This would need a PATCH endpoint
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (selectedEmployee) {
        fetchTasks(selectedEmployee.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding Workflow</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage employee onboarding progress
        </p>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {employees.map((emp) => (
              <Button
                key={emp.id}
                variant={selectedEmployee?.id === emp.id ? 'default' : 'outline'}
                className="justify-start h-auto py-3 px-4"
                onClick={() => setSelectedEmployee(emp)}
              >
                <div className="text-left">
                  <div className="font-medium">
                    {emp.first_name} {emp.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">{emp.email}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Tasks</CardTitle>
            <CardDescription>
              {selectedEmployee.first_name} {selectedEmployee.last_name} - {tasks.length} tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found for this employee
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.task_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      {selectedEmployee && tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: 'Completed',
                  count: tasks.filter((t) => t.status === 'completed').length,
                  color: 'bg-green-500',
                },
                {
                  label: 'In Progress',
                  count: tasks.filter((t) => t.status === 'in_progress').length,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Pending',
                  count: tasks.filter((t) => t.status === 'pending').length,
                  color: 'bg-gray-400',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count}/{tasks.length}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full transition-all`}
                      style={{ width: `${(item.count / tasks.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
