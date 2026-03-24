import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Plus, User, Building2, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Student {
  id: number;
  name: string;
  contact: string;
  room_number?: string;
}

const inputClass =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";
const inputClassLg =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editError, setEditError] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/students", { name: newName, contact: newContact });
      setIsAdding(false);
      setNewName("");
      setNewContact("");
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add student");
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!selectedStudent) return;
    try {
      await api.put(`/students/${selectedStudent.id}`, {
        name: editName,
        contact: editContact,
      });
      setShowEditModal(false);
      fetchStudents();
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete student");
    }
  };

  const assignedCount = students.filter((s) => s.room_number).length;
  const unassignedCount = students.filter((s) => !s.room_number).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Student Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register and manage student records
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
            <User className="w-5 h-5 text-secondary-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Students
            </p>
            <p className="text-2xl font-black text-foreground">
              {students.length}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent shrink-0">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned
            </p>
            <p className="text-2xl font-black text-foreground">
              {assignedCount}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-muted shrink-0">
            <UserX className="w-5 h-5 text-muted-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unassigned
            </p>
            <p className="text-2xl font-black text-foreground">
              {unassignedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-accent-foreground" /> Register
              Student
            </DialogTitle>
          </DialogHeader>
          {error && (
            <p className="text-destructive bg-destructive/10 border border-destructive/20 text-sm p-3 rounded-xl font-medium">
              {error}
            </p>
          )}
          <form onSubmit={handleAddStudent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Contact
              </label>
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className={inputClass}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            All Students
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-3.5 border-b border-border">Name</th>
              <th className="px-6 py-3.5 border-b border-border">Contact</th>
              <th className="px-6 py-3.5 border-b border-border">Allocation</th>
              <th className="px-6 py-3.5 border-b border-border text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-muted-foreground font-medium animate-pulse"
                >
                  Loading directory...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-muted-foreground"
                >
                  No students found. Register one above!
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent ring-2 ring-accent-foreground/20 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <span className="font-semibold text-foreground">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {student.contact || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {student.room_number ? (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-accent text-accent-foreground border border-accent-foreground/20 inline-flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Room{" "}
                        {student.room_number}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-muted text-muted-foreground border border-border inline-flex items-center gap-1.5">
                        <UserX className="w-3 h-3" /> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setEditName(student.name);
                        setEditContact(student.contact || "");
                        setShowEditModal(true);
                      }}
                      className="text-foreground font-semibold text-sm hover:text-accent-foreground transition-colors"
                    >
                      Edit
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <button className="text-destructive font-semibold text-sm hover:text-destructive/80 transition-colors">
                          Delete
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border border-border rounded-2xl shadow-2xl sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-foreground">
                            Delete Student?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            All allocations and payments for this student will
                            be permanently removed. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-semibold border-border text-foreground hover:bg-muted transition-colors">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(student.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold transition-all"
                          >
                            Confirm Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit Student
            </DialogTitle>
          </DialogHeader>
          {editError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium">
              {editError}
            </div>
          )}
          <form onSubmit={handleEditStudent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClassLg}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Contact
              </label>
              <input
                type="text"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                className={inputClassLg}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
