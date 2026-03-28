'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { Employee } from '@/lib/types';
import AddEmployeeDialog from '@/components/employees/add-employee-dialog';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/employees');

      if (!res.ok) {
        throw new Error("API failed");
      }

      const result = await res.json();

      console.log("API RESULT:", result);

      const employeesData = Array.isArray(result?.data) ? result.data : [];

      setEmployees(employeesData);
      setFilteredEmployees(employeesData);

    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    const filtered = employees.filter(
      (emp) =>
        (emp.first_name || '').toLowerCase().includes(term.toLowerCase()) ||
        (emp.last_name || '').toLowerCase().includes(term.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(term.toLowerCase())
    );

    setFilteredEmployees(filtered);
  };

  const handleEmployeeAdded = () => {
    setShowAddDialog(false);
    fetchEmployees();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Manage employee onboarding</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Employee List</CardTitle>
          <CardDescription className="text-sm">
            {filteredEmployees.length} employees
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm">Name</th>
                      <th className="text-left py-3 px-4 text-sm">Email</th>
                      <th className="text-left py-3 px-4 text-sm">Department</th>
                      <th className="text-left py-3 px-4 text-sm">Position</th>
                      <th className="text-left py-3 px-4 text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-sm">Start Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-medium">
                          {emp.first_name || "No"} {emp.last_name || "Name"}
                        </td>

                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {emp.email || "No Email"}
                        </td>

                        <td className="py-3 px-4 text-sm">
                          {emp.department || "N/A"}
                        </td>

                        <td className="py-3 px-4 text-sm">
                          {emp.position || "N/A"}
                        </td>

                        <td className="py-3 px-4 text-sm">
                          <Badge className={getStatusBadgeColor(emp.onboarding_status || '')}>
                            {(emp.onboarding_status || '').replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {emp.start_date
                            ? new Date(emp.start_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {emp.first_name || "No"} {emp.last_name || "Name"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.email || "No Email"}
                        </p>
                      </div>

                      <Badge className={getStatusBadgeColor(emp.onboarding_status || '')}>
                        {(emp.onboarding_status || '').replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p>{emp.department || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Position</p>
                        <p>{emp.position || "N/A"}</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-muted-foreground">Start Date</p>
                        <p>
                          {emp.start_date
                            ? new Date(emp.start_date).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  );
}