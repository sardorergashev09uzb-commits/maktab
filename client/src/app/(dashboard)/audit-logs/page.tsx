'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AuditLog } from '@/types';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (actionFilter !== 'all') {
        params['action'] = actionFilter;
      }
      const res = await api.auditLog.getAll(params);
      setLogs(res.items || []);
      setTotalCount(res._meta?.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('delete') || action.includes('reject')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('update') || action.includes('override')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (action.includes('enroll') || action.includes('approve') || action.includes('payment')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Xavfsizlik & Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Jurnali (Audit Trail)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tizimdagi barcha ma'muriy amallar, o'zgarishlar, ruxsatnomalar va harakatlar tarixi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Harakat turi:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Barcha amallar</option>
            <option value="system_init">Tizim ishga tushishi</option>
            <option value="update_settings">Sozlamalar tahrirlanishi</option>
            <option value="enroll">O'quvchi qabul qilinishi</option>
            <option value="override">Baho o'zgartirilishi</option>
            <option value="payment">To'lov rasmiylashtirilishi</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Jami qaydlar: <span className="font-bold text-slate-900">{totalCount} ta</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Amal / Harakat</th>
                <th className="py-3.5 px-4">Model</th>
                <th className="py-3.5 px-4">Xodim / Foydalanuvchi</th>
                <th className="py-3.5 px-4">Tafsilotlar</th>
                <th className="py-3.5 px-4">IP Manzil</th>
                <th className="py-3.5 px-4 text-right">Sana & Vaqt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Audit jurnali yozuvlari topilmadi
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {log.model ? (
                        <div className="text-xs font-bold text-slate-800">
                          {log.model} {log.model_id ? <span className="text-slate-400">#{log.model_id}</span> : ''}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.user ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.user.first_name} {log.user.last_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tizim (System)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-600 font-mono">
                      {log.details || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.created_at * 1000).toLocaleString('uz-UZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
