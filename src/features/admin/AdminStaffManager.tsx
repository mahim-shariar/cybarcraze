import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  UserCheck, 
  Trash2, 
  Key, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { AdminRole } from './AdminLayout';

interface StaffUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  phone?: string | null;
  role: AdminRole;
  createdAt?: string;
}

interface Props {
  currentStaffRole?: AdminRole;
}

export const AdminStaffManager: React.FC<Props> = ({ currentStaffRole = 'SUPER_ADMIN' }) => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('STAFF');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/users');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      } else {
        throw new Error('Failed to retrieve staff users');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim() || !newDisplayName.trim()) {
      setErrorMsg('Please enter email, password, and full staff name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/staff/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          displayName: newDisplayName.trim(),
          phone: newPhone.trim(),
          role: newRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccessMsg(`Successfully created ${newRole} account for ${newDisplayName}!`);
      setIsAddModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setNewPhone('');
      setNewRole('STAFF');
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not create staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/staff/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete staff user');
      }
      setSuccessMsg(`Account for ${userToDelete.displayName} has been removed.`);
      setUserToDelete(null);
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error removing staff account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Staff Roster & Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Staff & Manager Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create staff and manager credentials so employees can log into the operational console.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff / Manager</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Staff Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Console Users</div>
          <div className="text-2xl font-bold text-white mt-1">{staffList.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active login credentials</div>
        </div>
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Managers & Admins</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {staffList.filter(s => s.role === 'SUPER_ADMIN' || s.role === 'MANAGER').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full & elevated privileges</div>
        </div>
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Frontdesk Staff</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {staffList.filter(s => s.role === 'STAFF').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Counter check-in & floor sync</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#101624] border border-slate-800 rounded-2xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Active Staff Directory</span>
          </h3>
          <span className="text-xs text-slate-400">{staffList.length} Accounts Registered</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading accounts...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No staff accounts found. Click "Add Staff / Manager" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role / Permissions</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{member.displayName}</div>
                      <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                        member.role === 'SUPER_ADMIN' 
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                          : member.role === 'MANAGER'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{member.role === 'SUPER_ADMIN' ? 'Super Admin' : member.role === 'MANAGER' ? 'Manager' : 'Staff'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {member.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setUserToDelete(member)}
                        className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                        title="Delete staff account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-blue-500/40 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Create Staff / Manager Account</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full Name / Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Login Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tanvir@cybercraze.gg"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Login Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter login password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Role & Permission Level
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STAFF">Staff (Live stations, check-in, bookings, walk-ins)</option>
                  <option value="MANAGER">Manager (Staff + fleet hardware, categories, pricing, CRM)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full system, user management, audit logs, settings)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 text-slate-300 rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-rose-500/50 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base text-white">Delete User Account</h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently revoke staff access for <strong>{userToDelete.displayName}</strong> ({userToDelete.email})?
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Revoke & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
