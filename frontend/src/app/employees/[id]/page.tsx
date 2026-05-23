"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Employee } from "@/lib/api";
import EmployeeForm from "@/components/EmployeeForm";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.employees
      .get(id)
      .then(setEmployee)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading…</div>;
  if (error) return <div className="p-8 text-red-500 text-sm">{error}</div>;
  if (!employee) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Employee</h2>
        <p className="text-sm text-gray-500 mt-1">{employee.fullName}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EmployeeForm employee={employee} />
      </div>
    </div>
  );
}
