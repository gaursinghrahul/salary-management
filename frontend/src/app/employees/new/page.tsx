import EmployeeForm from "@/components/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add Employee</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to add a new employee.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EmployeeForm />
      </div>
    </div>
  );
}
