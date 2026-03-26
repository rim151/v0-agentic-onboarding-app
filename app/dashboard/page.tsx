'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Users, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeOnboarding: 0,
    completedOnboarding: 0,
    tasksAtRisk: 0,
    tasksCompleted: 0,
    delaysDetected: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch employees
        const empRes = await fetch('/api/employees');
        const empData = await empRes.json();
        const employees = empData.data || [];

        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        const tasks = tasksData.data || [];

        // Fetch assignments
        const assignRes = await fetch('/api/assignments');
        const assignData = await assignRes.json();
        const assignments = assignData.data || [];

        setStats({
          totalEmployees: employees.length,
          activeOnboarding: employees.filter((e: any) => e.onboarding_status === 'in_progress').length,
          completedOnboarding: employees.filter((e: any) => e.onboarding_status === 'completed').length,
          tasksAtRisk: assignments.filter((a: any) => a.is_delayed).length,
          tasksCompleted: assignments.filter((a: any) => a.status === 'completed').length,
          delaysDetected: assignments.filter((a: any) => a.delay_escalated).length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    variant = 'default'
  }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }) => {
    const colorMap = {
      default: 'bg-primary/10 text-primary',
      success: 'bg-green-500/10 text-green-600',
      warning: 'bg-yellow-500/10 text-yellow-600',
      danger: 'bg-red-500/10 text-red-600',
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorMap[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your employee onboarding system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="Employees in system"
          variant="default"
        />
        <StatCard
          title="Active Onboarding"
          value={stats.activeOnboarding}
          icon={Zap}
          description="Actively being onboarded"
          variant="default"
        />
        <StatCard
          title="Completed"
          value={stats.completedOnboarding}
          icon={CheckCircle2}
          description="Completed onboarding"
          variant="success"
        />
        <StatCard
          title="Tasks At Risk"
          value={stats.tasksAtRisk}
          icon={AlertCircle}
          description="Tasks that may be delayed"
          variant="warning"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          icon={CheckCircle2}
          description="Successfully completed tasks"
          variant="success"
        />
        <StatCard
          title="Delays Detected"
          value={stats.delaysDetected}
          icon={Clock}
          description="Escalated delays"
          variant="danger"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Real-time monitoring of onboarding process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm font-medium">Monitoring Agent Status</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm font-medium">Delay Detection</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">24h Threshold</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Decision Agent Status</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
