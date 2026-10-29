import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink, Calendar, User } from 'lucide-react';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import { inquiryApi } from '../../api/inquiryApi';
import { formatDate } from '../../utils/formatters';

export const StudentInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        setLoading(true);
        const data = await inquiryApi.getMyInquiries();
        setInquiries(data || []);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, []);

  const columns = [
    {
      header: 'Listing',
      accessor: 'targetTitle',
      render: (row) => (
        <div>
          <Link
            to={row.targetType === 'MESS' ? `/messes/${row.targetId}` : `/pgs/${row.targetId}`}
            className="font-bold text-slate-900 hover:text-teal-700 block"
          >
            {row.targetTitle || `Accommodation #${row.targetId}`}
          </Link>
          <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
            {row.targetType}
          </span>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.ownerName || 'Property Owner'}
        </span>
      )
    },
    {
      header: 'My Message',
      accessor: 'message',
      render: (row) => (
        <p className="text-xs text-slate-600 italic max-w-sm line-clamp-2">
          "{row.message}"
        </p>
      )
    },
    {
      header: 'Sent On',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            row.status === 'CONTACTED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {row.status === 'CONTACTED' ? 'Owner Contacted' : 'Awaiting Reply'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Inquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          History and reply statuses of inquiries you sent to PG & Mess owners
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-white/70 animate-pulse rounded-2xl" />
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Inquiries Sent Yet"
          description="When you message a PG or mess owner from their listing page, tracking updates will show up here."
          actionLabel="Find Accommodations"
          onAction={() => (window.location.href = '/pgs')}
        />
      ) : (
        <DataTable
          columns={columns}
          data={inquiries}
          emptyMessage="No inquiries sent yet."
        />
      )}
    </div>
  );
};

export default StudentInquiries;

