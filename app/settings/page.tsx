'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure AI agent behavior and system parameters
        </p>
      </div>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Control AI agent behavior and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Agent */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Task Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Generates onboarding task lists
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-model">Groq Model</Label>
                <Select defaultValue="mixtral">
                  <SelectTrigger id="task-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixtral">mixtral-8x7b-32768</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-temp">Temperature</Label>
                <Input
                  id="task-temp"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                />
              </div>
            </div>
          </div>

          {/* Execution Agent */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Execution Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Assigns tasks to team members
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exec-model">Groq Model</Label>
                <Select defaultValue="mixtral">
                  <SelectTrigger id="exec-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixtral">mixtral-8x7b-32768</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exec-temp">Temperature</Label>
                <Input
                  id="exec-temp"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.5"
                />
              </div>
            </div>
          </div>

          {/* Monitoring Agent */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Monitoring Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Tracks task status and detects delays
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delay-threshold">Delay Threshold (hours)</Label>
                <Input
                  id="delay-threshold"
                  type="number"
                  defaultValue="24"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-interval">Check Interval (minutes)</Label>
                <Input
                  id="check-interval"
                  type="number"
                  defaultValue="15"
                  min="5"
                />
              </div>
            </div>
          </div>

          {/* Decision Agent */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Decision Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Makes escalation and reassignment decisions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-escalate" defaultChecked />
                <Label htmlFor="auto-escalate" className="text-sm font-normal">
                  Auto-escalate delays
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-reassign" defaultChecked />
                <Label htmlFor="auto-reassign" className="text-sm font-normal">
                  Auto-reassign tasks
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>General system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all AI agent decisions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications on delays and escalations
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary">Save Changes</Button>
      </div>
    </div>
  );
}
