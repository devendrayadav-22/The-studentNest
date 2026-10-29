import React, { useState, useEffect } from 'react';
import { Users, UserX, UserCheck, Shield, Filter } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const { success, error: toastError } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(selectedRole || null);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const handleToggleBlock = async (user) => {
    try {
      setUpdatingId(user.id);
      let updated;
      if (user.blocked) {
        updated = await adminApi.unblockUser(user.id);
        success(`User "${user.name}" unblocked successfully.`);
      } else {
        updated = await adminApi.blockUser(user.id);
        success(`User "${user.name}" blocked from logging in.`);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? updated : u))
      );
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update user block status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      header: 'User Name & Email',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-xs text-slate-500">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => {
        const roleColors = {
          STUDENT: 'bg-teal-100 text-teal-800',
          PG_OWNER: 'bg-blue-100 text-blue-800',
          MESS_OWNER: 'bg-orange-100 text-orange-800',
          ADMIN: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${roleColors[row.role] || 'bg-slate-100'}`}>
            {row.role}
          </span>
        );
      }
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => <span className="text-xs text-slate-700">{row.phone || 'N/A'}</span>
    },
    {
      header: 'Details',
      accessor: 'college',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.course ? `${row.course} (${row.homeCity || 'Indore'})` : row.ownerBusinessName || 'Platform User'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'blocked',
      render: (row) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            row.blocked
              ? 'bg-red-100 text-red-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {row.blocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        row.role === 'ADMIN' ? (
          <span className="text-xs text-slate-400 italic">Protected</span>
        ) : (
          <Button
            variant={row.blocked ? 'primary' : 'danger'}
            size="xs"
            loading={updatingId === row.id}
            icon={row.blocked ? UserCheck : UserX}
            onClick={() => handleToggleBlock(row)}
            className={row.blocked ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {row.blocked ? 'Unblock' : 'Block User'}
          </Button>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student accounts, accommodation providers, and manage platform access
          </p>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 px-2">Filter:</span>
          {[
            { label: 'All Users', value: '' },
            { label: 'Students', value: 'STUDENT' },
            { label: 'PG Owners', value: 'PG_OWNER' },
            { label: 'Mess Owners', value: 'MESS_OWNER' }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSelectedRole(item.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === item.value
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No registered users found matching filter."
      />
    </div>
  );
};

export default AdminUsers;

