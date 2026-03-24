import React, { useState, useEffect } from "react";
import api from "../lib/api";
import {
  Plus,
  Building2,
  BedDouble,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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

interface Room {
  id: number;
  room_number: string;
  capacity: number;
  current_occupancy: number;
}

const inputClass =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";
const inputClassLg =
  "w-full bg-background text-foreground border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all shadow-sm placeholder:text-muted-foreground";

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCapacity, setFilterCapacity] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState<number | string>(1);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState<number | string>(1);
  const [editError, setEditError] = useState("");

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let url = "/rooms?";
      if (filterCapacity) url += `capacity=${filterCapacity}&`;
      if (filterAvailable) url += `available=true`;
      const res = await api.get(url);
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterCapacity, filterAvailable]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/rooms", {
        room_number: newRoomNumber,
        capacity: Number(newCapacity),
      });
      setIsAdding(false);
      setNewRoomNumber("");
      setNewCapacity(1);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add room");
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!selectedRoom) return;
    try {
      await api.put(`/rooms/${selectedRoom.id}`, {
        room_number: editRoomNumber,
        capacity: Number(editCapacity),
      });
      setShowEditModal(false);
      fetchRooms();
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update room");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(
    (r) => r.current_occupancy < r.capacity,
  ).length;
  const fullRooms = rooms.filter(
    (r) => r.current_occupancy >= r.capacity,
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Room Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage hostel rooms and capacity
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
            <Building2 className="w-5 h-5 text-secondary-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Rooms
            </p>
            <p className="text-2xl font-black text-foreground">{totalRooms}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent shrink-0">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available
            </p>
            <p className="text-2xl font-black text-foreground">
              {availableRooms}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-destructive/10 shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full
            </p>
            <p className="text-2xl font-black text-foreground">{fullRooms}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filter:
        </span>
        <input
          type="number"
          placeholder="Capacity"
          value={filterCapacity}
          onChange={(e) => setFilterCapacity(e.target.value)}
          className="bg-background border border-input text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 w-28 placeholder:text-muted-foreground"
        />
        <label className="flex items-center gap-2 text-sm text-foreground font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
            className="accent-primary rounded"
          />
          Available only
        </label>
        {(filterCapacity || filterAvailable) && (
          <button
            onClick={() => {
              setFilterCapacity("");
              setFilterAvailable(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-accent-foreground" /> New Room
            </DialogTitle>
          </DialogHeader>
          {error && (
            <p className="text-destructive bg-destructive/10 border border-destructive/20 text-sm p-3 rounded-xl font-medium">
              {error}
            </p>
          )}
          <form onSubmit={handleAddRoom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Room Number
              </label>
              <input
                type="text"
                required
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className={inputClass}
                placeholder="e.g. A-101"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className={inputClass}
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
                Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Room Directory
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-3.5 border-b border-border">Room</th>
              <th className="px-6 py-3.5 border-b border-border">Capacity</th>
              <th className="px-6 py-3.5 border-b border-border">Occupancy</th>
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
                  Loading rooms...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground"
                >
                  No rooms found. Add one above!
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const pct = Math.round(
                  (room.current_occupancy / room.capacity) * 100,
                );
                const isFull = room.current_occupancy >= room.capacity;
                return (
                  <tr
                    key={room.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary shrink-0">
                          <Building2 className="w-4 h-4 text-secondary-foreground" />
                        </span>
                        <span className="font-bold text-foreground">
                          {room.room_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {room.capacity} beds
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          {room.current_occupancy}/{room.capacity}
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isFull ? (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-destructive/10 text-destructive border border-destructive/20 inline-flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" /> Full
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-accent text-accent-foreground border border-accent-foreground/20 inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setEditRoomNumber(room.room_number);
                          setEditCapacity(room.capacity);
                          setShowEditModal(true);
                        }}
                        className="text-foreground font-semibold text-sm hover:text-accent-foreground transition-colors"
                      >
                        Edit
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger >
                          <button className="text-destructive font-semibold text-sm hover:text-destructive/80 transition-colors">
                            Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border border-border rounded-2xl shadow-2xl sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-foreground">
                              Delete Room?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              All allocations for this room will be permanently
                              removed. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl font-semibold border-border text-foreground hover:bg-muted transition-colors">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(room.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold transition-all"
                            >
                              Confirm Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Room Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border border-border shadow-2xl rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit Room
            </DialogTitle>
          </DialogHeader>
          {editError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium">
              {editError}
            </div>
          )}
          <form onSubmit={handleEditRoom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Room Number
              </label>
              <input
                type="text"
                required
                value={editRoomNumber}
                onChange={(e) => setEditRoomNumber(e.target.value)}
                className={inputClassLg}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
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

export default Rooms;
