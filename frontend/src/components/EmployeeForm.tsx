"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Employee, api } from "@/lib/api";

type FormData = Omit<Employee, "id" | "createdAt" | "updatedAt">;

const defaultForm: FormData = {
  fullName: "",
  jobTitle: "",
  department: "",
  country: "",
  salary: 0,
  email: "",
  hireDate: "",
  employmentType: "full-time",
};

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contractor"] as const;

interface EmployeeFormProps {
  employee?: Employee;
}

export default function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    employee
      ? {
          fullName: employee.fullName,
          jobTitle: employee.jobTitle,
          department: employee.department,
          country: employee.country,
          salary: employee.salary,
          email: employee.email,
          hireDate: employee.hireDate.slice(0, 10),
          employmentType: employee.employmentType,
        }
      : defaultForm,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: field === "salary" ? Number(e.target.value) : e.target.value,
      }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required";
    if (!form.department.trim()) errs.department = "Department is required";
    if (!form.country.trim()) errs.country = "Country is required";
    if (!form.salary || form.salary <= 0)
      errs.salary = "Salary must be positive";
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
      errs.email = "Valid email is required";
    if (!form.hireDate) errs.hireDate = "Hire date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      if (employee) {
        await api.employees.update(employee.id, form);
      } else {
        await api.employees.create(form);
      }
      router.push("/employees");
      router.refresh();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({
    label,
    field,
    type = "text",
    children,
  }: {
    label: string;
    field: keyof FormData;
    type?: string;
    children?: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          value={String(form[field])}
          onChange={set(field)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors[field] ? "border-red-400" : "border-gray-300"
          }`}
        />
      )}
      {errors[field] && (
        <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name" field="fullName" />
        <Field label="Email" field="email" type="email" />
        <Field label="Job Title" field="jobTitle" />
        <Field label="Department" field="department" />
        <Field label="Country" field="country" />
        <Field label="Salary (USD)" field="salary" type="number">
          <input
            type="number"
            min={1}
            step={100}
            value={form.salary}
            onChange={set("salary")}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.salary ? "border-red-400" : "border-gray-300"
            }`}
          />
        </Field>
        <Field label="Hire Date" field="hireDate" type="date" />
        <Field label="Employment Type" field="employmentType">
          <select
            value={form.employmentType}
            onChange={set("employmentType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {submitting
            ? "Saving…"
            : employee
              ? "Update Employee"
              : "Add Employee"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
