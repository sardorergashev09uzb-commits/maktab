'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CoinReward, Student } from '@/types';
import { Gift, Trophy, Plus, ShoppingBag, CheckCircle2, AlertCircle, Medal, Crown } from 'lucide-react';

interface LeaderboardItem {
  student_id: number;
  total_coins: number;
  student_code: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<CoinReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shop' | 'leaderboard'>('shop');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<CoinReward | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    coins_cost: 50,
    stock_quantity: 10,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, lRes, sRes] = await Promise.all([
        api.getAll<CoinReward>('coin-reward'),
        api.coin.getLeaderboard(15),
        api.getAll<Student>('student'),
      ]);

      setRewards(rRes.items || []);
      setLeaderboard(lRes || []);
      setStudents(sRes.items || []);

      if (sRes.items?.length && !selectedStudentId) {
        setSelectedStudentId(sRes.items[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRedeemModal = (r: CoinReward) => {
    setSelectedReward(r);
    setRedeemModalOpen(true);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward || !selectedStudentId) return;

    try {
      await api.coin.redeem(selectedReward.id, selectedStudentId);
      alert(`${selectedReward.title} muvaffaqiyatli harid qilindi va buyurtma ro'yxatga olindi!`);
      setRedeemModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Harid qilishda xatolik yuz berdi (Coin yetarli emas bo\'lishi mumkin)');
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('coin-reward', {
        title: createForm.title,
        description: createForm.description,
        coins_cost: Number(createForm.coins_cost),
        stock_quantity: Number(createForm.stock_quantity),
        is_active: 1,
      });

      alert('Yangi sovg\'a do\'konga muvaffaqiyatli qo\'shildi!');
      setCreateModalOpen(false);
      setCreateForm({
        title: '',
        description: '',
        coins_cost: 50,
        stock_quantity: 10,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Sovg\'a qo\'shishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maktab Do'koni & Reyting</h1>
          <p className="text-slate-500 text-sm">
            O'quvchilar to'plagan coinlarini qiziqarli sovg'alarga almashtirishi va eng faol o'quvchilar shohsupasi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'shop'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag size={15} />
              Do'kon
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy size={15} />
              Reyting (Leaderboard)
            </button>
          </div>

          {activeTab === 'shop' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition font-medium text-xs shadow-sm"
            >
              <Plus size={16} />
              Sovg'a qo'shish
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : activeTab === 'shop' ? (
        /* SHOP TAB */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Gift size={20} />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {r.stock_quantity > 0 ? `${r.stock_quantity} ta qoldi` : 'Tugagan'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-1">{r.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{r.description || 'Maktab maxsus sovg\'asi'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Narxi</span>
                  <span className="text-lg font-extrabold text-amber-600">{r.coins_cost} coin</span>
                </div>

                <button
                  onClick={() => openRedeemModal(r)}
                  disabled={r.stock_quantity <= 0}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                    r.stock_quantity > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag size={14} />
                  Harid qilish
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LEADERBOARD TAB */
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 pt-4 pb-2 items-end">
              {/* 2nd place */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center space-y-2 order-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg border-2 border-slate-300">
                  2
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{leaderboard[1]?.first_name} {leaderboard[1]?.last_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{leaderboard[1]?.student_code}</p>
                </div>
                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full font-extrabold text-xs text-slate-700">
                  {leaderboard[1]?.total_coins} coin
                </span>
              </div>

              {/* 1st place */}
              <div className="bg-gradient-to-b from-amber-50 to-white p-5 rounded-xl border border-amber-300 shadow-md text-center space-y-2 order-2 -mt-4">
                <Crown size={28} className="mx-auto text-amber-500" />
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl border-2 border-amber-400">
                  1
                </div>
                <div>
                  <p className="font-bold text-base text-slate-900">{leaderboard[0]?.first_name} {leaderboard[0]?.last_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{leaderboard[0]?.student_code}</p>
                </div>
                <span className="inline-block px-3.5 py-1 bg-amber-100 rounded-full font-black text-sm text-amber-800 shadow-sm">
                  {leaderboard[0]?.total_coins} coin
                </span>
              </div>

              {/* 3rd place */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center space-y-2 order-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg border-2 border-amber-200">
                  3
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{leaderboard[2]?.first_name} {leaderboard[2]?.last_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{leaderboard[2]?.student_code}</p>
                </div>
                <span className="inline-block px-3 py-1 bg-amber-50 rounded-full font-extrabold text-xs text-amber-700">
                  {leaderboard[2]?.total_coins} coin
                </span>
              </div>
            </div>
          )}

          {/* Full List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {leaderboard.map((item, idx) => (
              <div key={item.student_id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <span className={`w-7 text-center font-bold text-sm ${idx < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {item.first_name[0]}{item.last_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.first_name} {item.last_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.student_code}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-amber-600 text-base">{item.total_coins}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1">coin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemModalOpen && selectedReward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-500" />
              Sovg'a harid qilish
            </h3>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
              <p><strong>Sovg'a:</strong> {selectedReward.title}</p>
              <p><strong>Narxi:</strong> {selectedReward.coins_cost} coin</p>
              <p><strong>Zaxirada:</strong> {selectedReward.stock_quantity} ta qoldi</p>
            </div>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quvchini tanlang</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user ? `${s.user.first_name} ${s.user.last_name} (${s.student_code})` : `O'quvchi #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRedeemModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-medium"
                >
                  Haridni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Reward Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Gift size={20} className="text-indigo-600" />
              Do'konga yangi sovg'a qo'shish
            </h3>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sovg'a Nomi</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Masalan: Maktab futbolkasi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Sovg'a haqida qisqacha ma'lumot..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Narxi (Coin)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={createForm.coins_cost}
                    onChange={(e) => setCreateForm({ ...createForm, coins_cost: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Zaxiradagi Soni</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={createForm.stock_quantity}
                    onChange={(e) => setCreateForm({ ...createForm, stock_quantity: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Do'konga chiqarish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
