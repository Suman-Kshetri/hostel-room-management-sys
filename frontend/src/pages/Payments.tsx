import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Plus, Receipt, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
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

interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  amount: string | number;
  status: string;
  date: string;
}

const inputClass =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";
const inputClassLg =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formStudent, setFormStudent] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formStatus, setFormStatus] = useState("Paid");
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState<string | number>("");
  const [editStatus, setEditStatus] = useState("Paid");
  const [editStudent, setEditStudent] = useState<string | number>("");
  const [editDate, setEditDate] = useState("");
  const [editError, setEditError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, stuRes] = await Promise.all([
        api.get("/payments"),
        api.get("/students"),
      ]);
      setPayments(payRes.data);
      setStudents(stuRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/payments", {
        student_id: formStudent,
        amount: parseFloat(formAmount),
        status: formStatus,
      });
      setIsAdding(false);
      setFormStudent("");
      setFormAmount("");
      setFormStatus("Paid");
      fetchData();
    } catch (err) {
      setError("Failed to record payment");
    }
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!selectedPayment) return;
    try {
      await api.put(`/payments/${selectedPayment.id}`, {
        amount: parseFloat(editAmount.toString()),
        status: editStatus,
        student_id: editStudent,
        date: new Date(editDate).toISOString(),
      });
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update payment");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/payments/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete payment");
    }
  };

  // Derived stats
  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);
  const pendingCount = payments.filter((p) => p.status === "Pending").length;
  const paidCount = payments.filter((p) => p.status === "Paid").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Payment Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and manage all student payments
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent shrink-0">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Collected
            </p>
            <p className="text-2xl font-black text-foreground">
              Rs {totalPaid.toFixed(0)}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent shrink-0">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paid
            </p>
            <p className="text-2xl font-black text-foreground">{paidCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
            <Clock className="w-5 h-5 text-secondary-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            <p className="text-2xl font-black text-foreground">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent-foreground" /> Record
              Payment
            </DialogTitle>
          </DialogHeader>
          {error && (
            <p className="text-destructive bg-destructive/10 border border-destructive/20 text-sm p-3 rounded-xl font-medium">
              {error}
            </p>
          )}
          <form onSubmit={handleAddPayment} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Student
              </label>
              <select
                required
                value={formStudent}
                onChange={(e) => setFormStudent(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Amount
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className={inputClass}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
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
                Record
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            All Payments
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-3.5 border-b border-border">Date</th>
              <th className="px-6 py-3.5 border-b border-border">Student</th>
              <th className="px-6 py-3.5 border-b border-border">Amount</th>
              <th className="px-6 py-3.5 border-b border-border">Status</th>
              <th className="px-6 py-3.5 border-b border-border text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground font-medium animate-pulse"
                >
                  Loading payments...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((pay) => (
                <tr
                  key={pay.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {new Date(pay.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {pay.student_name}
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    Rs {parseFloat(pay.amount.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {pay.status === "Paid" ? (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 bg-accent text-accent-foreground border border-accent-foreground/20">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-secondary-foreground/10">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedPayment(pay);
                        setEditAmount(pay.amount);
                        setEditStatus(pay.status);
                        setEditStudent(pay.student_id);
                        setEditDate(
                          new Date(pay.date).toISOString().substring(0, 10),
                        );
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
                            Delete Payment?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This payment record will be permanently removed.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-semibold border-border text-foreground hover:bg-muted transition-colors">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(pay.id)}
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

      {/* Edit Payment Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit Payment
            </DialogTitle>
          </DialogHeader>
          {editError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium">
              {editError}
            </div>
          )}
          <form onSubmit={handleEditPayment} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Student
              </label>
              <select
                required
                value={editStudent}
                onChange={(e) => setEditStudent(e.target.value)}
                className={inputClassLg}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Date
              </label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className={inputClassLg}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className={inputClassLg}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className={inputClassLg}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
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

export default Payments;
