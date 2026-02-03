import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 지연 초기화를 위한 싱글톤 패턴
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  // 서버 사이드에서는 null 반환
  if (typeof window === 'undefined') {
    return null;
  }

  // 이미 초기화된 경우 재사용
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없으면 null 반환
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 환경변수가 설정되지 않았습니다.');
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// 하위 호환성을 위한 export (사용하지 않는 것 권장)
export const supabase = null as unknown as SupabaseClient;

// RSVP 테이블 타입
export interface RSVP {
  id?: number;
  name: string;
  attending: 'yes' | 'no';
  guest_count: number;
  child_count?: number;
  message?: string;
  created_at?: string;
}

// RSVP 저장 함수
export async function saveRSVP(data: Omit<RSVP, 'id' | 'created_at'>) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  const { data: result, error } = await client
    .from('rsvps')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('RSVP 저장 실패:', error);
    throw error;
  }

  return result;
}

// RSVP 목록 조회
export async function getRSVPs() {
  const client = getSupabase();
  if (!client) {
    return [];
  }
  const { data, error } = await client
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('RSVP 조회 실패:', error);
    throw error;
  }

  return data;
}

// 사진 타입
export interface Photo {
  id?: number;
  file_path: string;
  file_url: string;
  uploaded_by?: string;
  created_at?: string;
}

// 사진 업로드 (Storage + DB)
export async function uploadPhoto(file: File, uploaderName?: string) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  // 1. Storage에 파일 업로드
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `wedding-photos/${fileName}`;

  const { data: uploadData, error: uploadError } = await client.storage
    .from('photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('사진 업로드 실패:', uploadError);
    throw uploadError;
  }

  // 2. Public URL 가져오기
  const { data: { publicUrl } } = client.storage
    .from('photos')
    .getPublicUrl(filePath);

  // 3. DB에 메타데이터 저장
  const { data: photoData, error: dbError } = await client
    .from('photos')
    .insert([{
      file_path: filePath,
      file_url: publicUrl,
      uploaded_by: uploaderName || 'Anonymous'
    }])
    .select()
    .single();

  if (dbError) {
    console.error('사진 메타데이터 저장 실패:', dbError);
    throw dbError;
  }

  return photoData;
}

// 사진 목록 조회
export async function getPhotos() {
  const client = getSupabase();
  if (!client) {
    return [];
  }
  const { data, error } = await client
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('사진 조회 실패:', error);
    console.error('에러 상세:', JSON.stringify(error, null, 2));
    // 테이블이 없거나 권한 문제인 경우 빈 배열 반환
    return [];
  }

  return data || [];
}

// 실시간 사진 구독
export function subscribeToPhotos(callback: (photo: Photo) => void) {
  const client = getSupabase();
  if (!client) {
    return null;
  }
  return client
    .channel('photos')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'photos' },
      (payload) => {
        callback(payload.new as Photo);
      }
    )
    .subscribe();
}

// 방명록 타입
export interface GuestbookEntry {
  id?: number;
  name: string;
  message: string;
  password?: string;
  created_at?: string;
}

// 방명록 작성
export async function saveGuestbook(data: Omit<GuestbookEntry, 'id' | 'created_at'>) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  const { data: result, error } = await client
    .from('guestbook')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('방명록 저장 실패:', error);
    throw error;
  }

  return result;
}

// 방명록 목록 조회
export async function getGuestbook() {
  const client = getSupabase();
  if (!client) {
    return [];
  }
  const { data, error } = await client
    .from('guestbook')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('방명록 조회 실패:', error);
    return [];
  }

  return data || [];
}

// 방명록 삭제 (비밀번호 확인)
export async function deleteGuestbook(id: number, password: string) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  // 먼저 비밀번호 확인
  const { data: entry, error: fetchError } = await client
    .from('guestbook')
    .select('password')
    .eq('id', id)
    .single();

  if (fetchError || !entry) {
    throw new Error('방명록을 찾을 수 없습니다.');
  }

  if (entry.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  // 비밀번호 일치하면 삭제
  const { error: deleteError } = await client
    .from('guestbook')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('방명록 삭제 실패:', deleteError);
    throw deleteError;
  }
}

// 실시간 방명록 구독
export function subscribeToGuestbook(callback: (entry: GuestbookEntry) => void) {
  const client = getSupabase();
  if (!client) {
    return null;
  }
  return client
    .channel('guestbook')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'guestbook' },
      (payload) => {
        callback(payload.new as GuestbookEntry);
      }
    )
    .subscribe();
}

// Q&A 타입
export interface QnA {
  id?: number;
  question: string;
  asker_name: string;
  groom_answer?: string;
  bride_answer?: string;
  is_approved: boolean;
  created_at?: string;
}

// Q&A 질문 작성
export async function saveQuestion(data: { question: string; asker_name: string }) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  const { data: result, error } = await client
    .from('qna')
    .insert([{
      ...data,
      is_approved: false
    }])
    .select()
    .single();

  if (error) {
    console.error('질문 저장 실패:', error);
    throw error;
  }

  return result;
}

// 승인된 Q&A 목록 조회
export async function getApprovedQnA() {
  const client = getSupabase();
  if (!client) {
    return [];
  }
  const { data, error } = await client
    .from('qna')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Q&A 조회 실패:', error);
    return [];
  }

  return data || [];
}

// 실시간 Q&A 구독
export function subscribeToQnA(callback: (qna: QnA) => void) {
  const client = getSupabase();
  if (!client) {
    return null;
  }
  return client
    .channel('qna')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'qna' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as QnA);
        }
      }
    )
    .subscribe();
}
