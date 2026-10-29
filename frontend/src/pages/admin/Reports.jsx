import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const { success, error: toastError } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const updated = await adminApi.updateReportStatus(id, status);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      success(`Report status updated to ${status}.`);
    } catch (err) {
      toastError('Failed to update report status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      header: 'Reported Accommodation',
      accessor: 'targetType',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.targetType} #{row.targetId}
          </span>
          <span className="text-[11px] text-slate-500">
            Reporter: <strong>{row.reporterName}</strong>
          </span>
        </div>
      )
    },
    {
      header: 'Report Reason',
      accessor: 'reason',
      render: (row) => (
        <p className="text-xs text-slate-700 italic max-w-sm">
          "{row.reason}"
        </p>
      )
    },
    {
      header: 'Submitted On',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      header: 'Current Status',
      accessor: 'status',
      render: (row) => {
        const statusColors = {
          OPEN: 'bg-red-100 text-red-800',
          RESOLVED: 'bg-emerald-100 text-emerald-800',
          DISMISSED: 'bg-slate-100 text-slate-700'
        };
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusColors[row.status] || 'bg-slate-100'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Admin Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'RESOLVED' && (
            <Button
              variant="primary"
              size="xs"
              icon={CheckCircle}
              loading={updatingId === row.id}
              onClick={() => handleUpdateStatus(row.id, 'RESOLVED')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Resolve
            </Button>
          )}

          {row.status !== 'DISMISSED' && (
            <Button
              variant="secondary"
              size="xs"
              icon={XCircle}
              loading={updatingId === row.id}
              onClick={() => handleUpdateStatus(row.id, 'DISMISSED')}
            >
              Dismiss
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">User Reports & Grievances</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Investigate student complaints regarding inaccurate photos, fraud, or inappropriate house conduct
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        emptyMessage="No reports submitted yet."
      />
    </div>
  );
};

export default AdminReports;

