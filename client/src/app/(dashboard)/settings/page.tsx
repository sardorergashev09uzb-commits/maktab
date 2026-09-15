'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SystemSetting } from '@/types';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  CreditCard,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const [groupedSettings, setGroupedSettings] = useState<Record<string, SystemSetting[]>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.settings.getAll();
      setGroupedSettings(res || {});

      // Flatten initial form state
      const initial: Record<string, any> = {};
      Object.values(res || {}).forEach((group) => {
        group.forEach((item) => {
          if (item.type === 'boolean') {
            initial[item.key] = item.value === '1' || item.value === 'true';
          } else {
            initial[item.key] = item.value || '';
          }
        });
      });
      setFormData(initial);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Sozlamalarni yuklashda xatolik yuz berdi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      // Format payload (booleans to 1/0)
      const payload: Record<string, any> = {};
      Object.keys(formData).forEach((k) => {
        if (typeof formData[k] === 'boolean') {
          payload[k] = formData[k] ? '1' : '0';
        } else {
          payload[k] = formData[k];
        }
      });

      await api.settings.update(payload);
      setMessage({ type: 'success', text: 'Tizim sozlamalari muvaffaqiyatli saqlandi!' });
      await loadSettings();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Sozlamalarni saqlashda xatolik yuz berdi.' });
    } finally {
      setSaving(false);
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'general':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'academic':
        return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'finance':
        return <CreditCard className="w-5 h-5 text-amber-600" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-slate-600" />;
    }
  };

  const getGroupTitle = (group: string) => {
    switch (group) {
      case 'general':
        return 'Umumiy Maktab Rekvizitlari';
      case 'academic':
        return 'O\'quv Jarayoni & Akademik Qoidalar';
      case 'finance':
        return 'Moliya & To\'lov Sozlamalari';
      case 'notification':
        return 'Xabarnomalar & Tizim Integratsiyasi';
      default:
        return group.toUpperCase();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <Settings className="w-4 h-4" />
            <span>Konfiguratsiya & Boshqaruv</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tizim Sozlamalari</h1>
          <p className="text-slate-500 text-sm mt-1">
            Maktab ma'lumotlari, akademik mezonlar, 48 soat qoidasi, kassa va xabarnomalar parametrlarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {Object.entries(groupedSettings).map(([groupKey, settingsList]) => (
          <div key={groupKey} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              {getGroupIcon(groupKey)}
              <div>
                <h2 className="text-base font-bold text-slate-900">{getGroupTitle(groupKey)}</h2>
                <p className="text-xs text-slate-400">Guruh: #{groupKey}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {settingsList.map((s) => (
                <div key={s.id} className={s.type === 'json' || s.description ? 'col-span-1 md:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {s.title}
                  </label>
                  {s.description && (
                    <p className="text-[11px] text-slate-400 mb-2">{s.description}</p>
                  )}

                  {s.type === 'boolean' ? (
                    <label className="flex items-center gap-3 cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[s.key])}
                        onChange={(e) => handleChange(s.key, e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {formData[s.key] ? 'Yoqilgan (Faol)' : 'O\'chirilgan (Nofaol)'}
                      </span>
                    </label>
                  ) : s.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[s.key] ?? ''}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[s.key] ?? ''}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky bottom-6 z-10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Barcha Sozlamalarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
