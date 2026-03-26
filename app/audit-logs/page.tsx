'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuditLog } from '@/lib/types';
import { Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [agentFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/api/audit-logs?limit=100';
      if (agentFilter && agentFilter !== 'all') url += `&agentType=${agentFilter}`;
      if (actionFilter && actionFilter !== 'all') url += `&actionType=${actionFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.data || []);
      setFilteredLogs(data.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = logs.filter((log) =>
      log.description.toLowerCase().includes(term.toLowerCase()) ||
      log.agent_name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLogs(filtered);
  };

  const getAgentBadgeColor = (agentType: string) => {
    const colors: Record<string, string> = {
      TASK_AGENT: 'bg-purple-100 text-purple-800',
      EXECUTION_AGENT: 'bg-blue-100 text-blue-800',
      MONITORING_AGENT: 'bg-green-100 text-green-800',
      DECISION_AGENT: 'bg-orange-100 text-orange-800',
    };
    return colors[agentType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Complete audit trail of all AI agent decisions
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="TASK_AGENT">Task Agent</SelectItem>
            <SelectItem value="EXECUTION_AGENT">Execution Agent</SelectItem>
            <SelectItem value="MONITORING_AGENT">Monitoring Agent</SelectItem>
            <SelectItem value="DECISION_AGENT">Decision Agent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="GENERATE_TASKS">Generate Tasks</SelectItem>
            <SelectItem value="ASSIGN_TASK">Assign Task</SelectItem>
            <SelectItem value="UPDATE_TASK_STATUS">Update Status</SelectItem>
            <SelectItem value="DETECT_DELAY">Detect Delay</SelectItem>
            <SelectItem value="ESCALATE_TASK">Escalate Task</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Activity Log</CardTitle>
          <CardDescription>
            {filteredLogs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getAgentBadgeColor(log.agent_type)}>
                        {log.agent_name}
                      </Badge>
                      <Badge className={getStatusBadgeColor(log.result_status)}>
                        {log.result_status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-medium text-sm">{log.description}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{log.action_type}</p>
                  </div>

                  {log.reasoning && (
                    <div className="bg-muted/30 rounded px-3 py-2 mb-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>Reasoning:</strong> {log.reasoning}
                      </p>
                    </div>
                  )}

                  {log.error_message && (
                    <div className="bg-red-50 rounded px-3 py-2 border border-red-200">
                      <p className="text-xs text-red-800">
                        <strong>Error:</strong> {log.error_message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    {log.execution_time_ms && (
                      <span>Execution: {log.execution_time_ms}ms</span>
                    )}
                    {log.groq_prompt_tokens && (
                      <span>Tokens: {log.groq_prompt_tokens + (log.groq_completion_tokens || 0)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
