'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RSVP, GuestbookEntry } from '../lib/supabase';

const ADMIN_PASSWORD = '10921902'; // 간단한 비밀번호

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'rsvp' | 'guestbook'>('rsvp');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    // RSVP 데이터 로드
    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });
    setRsvps(rsvpData || []);

    // 방명록 데이터 로드
    const { data: guestbookData } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    setGuestbook(guestbookData || []);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀립니다.');
    }
  };

  // 통계 계산
  const stats = {
    totalResponses: rsvps.length,
    attending: rsvps.filter(r => r.attending === 'yes').length,
    notAttending: rsvps.filter(r => r.attending === 'no').length,
    totalAdults: rsvps.filter(r => r.attending === 'yes').reduce((sum, r) => sum + (r.guest_count || 0), 0),
    totalChildren: rsvps.filter(r => r.attending === 'yes').reduce((sum, r) => sum + (r.child_count || 0), 0),
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold text-center mb-4 text-slate-800">관리자 로그인</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">청첩장 관리</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.totalResponses}</div>
            <div className="text-xs text-slate-500">총 응답</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
            <div className="text-xs text-slate-500">참석</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.notAttending}</div>
            <div className="text-xs text-slate-500">불참</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAdults}</div>
            <div className="text-xs text-slate-500">성인 인원</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalChildren}</div>
            <div className="text-xs text-slate-500">소인 인원</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('rsvp')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'rsvp'
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              참석 여부 ({rsvps.length})
            </button>
            <button
              onClick={() => setActiveTab('guestbook')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'guestbook'
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              방명록 ({guestbook.length})
            </button>
          </div>

          {/* RSVP 목록 */}
          {activeTab === 'rsvp' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">이름</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">참석</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">성인</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">소인</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">메시지</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{rsvp.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rsvp.attending === 'yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {rsvp.attending === 'yes' ? '참석' : '불참'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {rsvp.attending === 'yes' ? rsvp.guest_count : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {rsvp.attending === 'yes' ? (rsvp.child_count || 0) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {rsvp.message || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDate(rsvp.created_at)}
                      </td>
                    </tr>
                  ))}
                  {rsvps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        아직 응답이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 방명록 목록 */}
          {activeTab === 'guestbook' && (
            <div className="divide-y divide-slate-100">
              {guestbook.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-800">{entry.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{entry.message}</p>
                </div>
              ))}
              {guestbook.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  아직 방명록이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 새로고침 버튼 */}
        <div className="mt-4 text-center">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300 transition"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}
