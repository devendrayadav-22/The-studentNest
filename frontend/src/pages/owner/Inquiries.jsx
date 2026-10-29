import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import { inquiryApi } from '../../api/inquiryApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const OwnerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { success, error: toastError } = useToast();

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await inquiryApi.getReceivedInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.error('Failed to load received inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleMarkContacted = async (id) => {
    try {
      setUpdatingId(id);
      const updated = await inquiryApi.updateStatus(id, 'CONTACTED');
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      success('Marked as contacted!');
    } catch (err) {
      toastError('Failed to update inquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'studentName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.studentName}</span>
          <div className="flex flex-col gap-0.5 text-xs text-slate-500 mt-0.5">
            <a href={`tel:${row.studentPhone}`} className="text-blue-600 hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{row.studentPhone}</span>
            </a>
            <a href={`mailto:${row.studentEmail}`} className="text-slate-500 hover:underline flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{row.studentEmail}</span>
            </a>
          </div>
        </div>
      )
    },
    {
      header: 'Target Listing',
      accessor: 'targetTitle',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-800">
          {row.targetTitle || `Listing #${row.targetId}`}
        </span>
      )
    },
    {
      header: 'Student Message',
      accessor: 'message',
      render: (row) => (
        <p className="text-xs text-slate-600 italic max-w-sm">
          "{row.message}"
        </p>
      )
    },
    {
      header: 'Received Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      header: 'Status & Action',
      accessor: 'status',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'CONTACTED' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Contacted
            </span>
          ) : (
            <Button
              variant="secondary"
              size="xs"
              loading={updatingId === row.id}
              onClick={() => handleMarkContacted(row.id)}
            >
              Mark Contacted
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Student Inquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Direct inquiry messages and phone contacts received from prospective students
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-white/70 animate-pulse rounded-2xl" />
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Inquiries Received Yet"
          description="Inquiries sent by students through your PG listings will appear here with direct contact details."
        />
      ) : (
        <DataTable
          columns={columns}
          data={inquiries}
          emptyMessage="No inquiries received yet."
        />
      )}
    </div>
  );
};

export default OwnerInquiries;

