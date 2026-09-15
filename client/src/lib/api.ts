import {
  LoginResponse,
  User,
  ApiListResponse,
  DeadlineInfo,
  DirectorKpi,
  AcademicKpi,
  FinancialAnalytics,
  SystemSetting,
  AuditLog,
  StudentPortalData,
  ParentPortalData,
  TeacherPortalData,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/v1';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API request failed');
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message !== 'API request failed') {
      throw new Error(error.message || 'Server bilan aloqa yo\'q. Internet yoki backend tekshiring.');
    }
    throw error;
  }
}

export const api = {
  auth: {
    login: (credentials: any) => fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (data: any) => fetchApi<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getProfile: () => fetchApi<User>('/auth/profile'),
    changePassword: (data: { old_password: string; new_password: string }) =>
      fetchApi<{ success: boolean; message: string; token: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  attendance: {
    batchSave: (lessonId: number, records: Array<{ student_id: number; status: number; remarks?: string }>) =>
      fetchApi<{ success: boolean; message: string; data: any }>('/attendance/batch', {
        method: 'POST',
        body: JSON.stringify({ lesson_id: lessonId, records }),
      }),
  },

  lesson: {
    getDeadline: (lessonId: number, studentId?: number) => {
      const query = studentId ? `?student_id=${studentId}` : '';
      return fetchApi<DeadlineInfo>(`/lesson/${lessonId}/deadline${query}`);
    },
  },

  gradeOverride: {
    approve: (id: number, decision_notes?: string) =>
      fetchApi<{ success: boolean; message: string; grade: any }>(`/grade-override/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ decision_notes }),
      }),
    reject: (id: number, decision_notes?: string) =>
      fetchApi<{ success: boolean; message: string; override: any }>(`/grade-override/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ decision_notes }),
      }),
  },

  submission: {
    grade: (id: number, score: number, teacher_feedback?: string) =>
      fetchApi<{ success: boolean; message: string; data: any }>(`/submission/${id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, teacher_feedback }),
      }),
  },

  exam: {
    start: (id: number, studentId?: number) =>
      fetchApi<{ success: boolean; attempt: any; exam: any }>(`/exam/${id}/start`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
      }),
  },

  examAttempt: {
    submit: (id: number, answers: Array<{ question_id: number; selected_option_id?: number; text_answer?: string }>) =>
      fetchApi<{ success: boolean; message: string; attempt: any }>(`/exam-attempt/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
  },

  contract: {
    generateInvoices: (id: number) =>
      fetchApi<{ success: boolean; message: string; invoices: any[] }>(`/contract/${id}/generate-invoices`, {
        method: 'POST',
      }),
  },

  payment: {
    pay: (data: { invoice_id: number; amount: number; payment_method: string; transaction_reference?: string; notes?: string }) =>
      fetchApi<{ success: boolean; payment: any; invoice: any }>(`/payment/pay`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    reverse: (id: number, reason: string) =>
      fetchApi<{ success: boolean; payment: any }>(`/payment/${id}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  coin: {
    award: (data: { student_id: number; amount: number; reason: string; reference_type?: string; reference_id?: number }) =>
      fetchApi<{ success: boolean; transaction: any; new_balance: number }>(`/coin-transaction/award`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    spend: (data: { student_id: number; amount: number; reason: string }) =>
      fetchApi<{ success: boolean; transaction: any; new_balance: number }>(`/coin-transaction/spend`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getBalance: (studentId: number) =>
      fetchApi<{ student_id: number; balance: number }>(`/coin-transaction/balance/${studentId}`),
    getLeaderboard: (limit?: number) =>
      fetchApi<Array<{ student_id: number; total_coins: number; student_code: string; first_name: string; last_name: string; avatar?: string }>>(`/coin-transaction/leaderboard${limit ? `?limit=${limit}` : ''}`),
    redeem: (rewardId: number, studentId: number) =>
      fetchApi<{ success: boolean; redemption: any; new_balance: number }>(`/coin-reward/${rewardId}/redeem`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
      }),
  },

  finance: {
    getStats: () => fetchApi<FinancialAnalytics>(`/finance/stats`),
  },

  achievement: {
    award: (data: { student_id: number; achievement_id: number; notes?: string }) =>
      fetchApi<{ success: boolean; student_achievement: any; achievement: any }>(`/achievement/award`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  certificate: {
    verify: (id: number, status: number, review_notes?: string) =>
      fetchApi<{ success: boolean; certificate: any }>(`/certificate/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status, review_notes }),
      }),
  },

  notification: {
    getAll: () => fetchApi<any[]>(`/notification`),
    read: (id: number) =>
      fetchApi<{ success: boolean }>(`/notification/${id}/read`, {
        method: 'POST',
      }),
    unreadCount: () => fetchApi<{ unread_count: number }>(`/notification/unread-count`),
  },

  portal: {
    student: (studentId?: number) =>
      fetchApi<StudentPortalData>(`/portal/student${studentId ? `?student_id=${studentId}` : ''}`),
    parent: (parentId?: number) =>
      fetchApi<ParentPortalData>(`/portal/parent${parentId ? `?parent_id=${parentId}` : ''}`),
    teacher: (teacherId?: number) =>
      fetchApi<TeacherPortalData>(`/portal/teacher${teacherId ? `?teacher_id=${teacherId}` : ''}`),
  },

  survey: {
    getAll: () => fetchApi<any[]>(`/survey`),
    getDetail: (id: number) => fetchApi<any>(`/survey/${id}/detail`),
    submit: (id: number, answers: any[], targetTeacherId?: number) =>
      fetchApi<any>(`/survey/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, target_teacher_id: targetTeacherId }),
      }),
    getAnalytics: (id: number) => fetchApi<any>(`/survey/${id}/analytics`),
  },

  surveyResponse: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<any>(`/survey-response${query}`);
    },
  },

  admission: {
    apply: (data: any) =>
      fetchApi<any>(`/admission/apply`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<any>(`/admission${query}`);
    },
    updateStatus: (id: number, data: { status: string; notes?: string; interview_date?: string; exam_score?: number }) =>
      fetchApi<any>(`/admission/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    enroll: (id: number, schoolClassId: number, annualTuitionFee?: number) =>
      fetchApi<any>(`/admission/${id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ school_class_id: schoolClassId, annual_tuition_fee: annualTuitionFee }),
      }),
    getStats: () => fetchApi<any>(`/admission/stats`),
  },

  cms: {
    getPublic: () => fetchApi<any>(`/cms/public`),
    getSections: () => fetchApi<any[]>(`/cms/sections`),
    updateSection: (id: number, data: any) =>
      fetchApi<any>(`/cms/sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getFaqs: () => fetchApi<any[]>(`/cms/faqs`),
    createFaq: (data: any) =>
      fetchApi<any>(`/cms/faqs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateFaq: (id: number, data: any) =>
      fetchApi<any>(`/cms/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  analytics: {
    getDirector: () => fetchApi<DirectorKpi>(`/analytics/director`),
    getAcademic: () => fetchApi<AcademicKpi>(`/analytics/academic`),
    getFinance: () => fetchApi<FinancialAnalytics>(`/analytics/finance`),
    getExportUrl: (type: string) => `${API_URL}/analytics/export?type=${type}`,
  },

  settings: {
    getAll: () => fetchApi<Record<string, SystemSetting[]>>(`/setting`),
    update: (data: Record<string, any>) =>
      fetchApi<any>(`/setting`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  auditLog: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiListResponse<AuditLog>>(`/audit-log${query}`);
    },
  },
  
  // Generic CRUD
  getAll: async <T>(resource: string, params?: Record<string, string>): Promise<ApiListResponse<T>> => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetchApi<any>(`/${resource}${query}`);
    if (Array.isArray(res)) {
      return {
        items: res,
        _meta: {
          totalCount: res.length,
          pageCount: 1,
          currentPage: 1,
          perPage: res.length,
        },
      };
    }
    return res || { items: [], _meta: { totalCount: 0, pageCount: 0, currentPage: 1, perPage: 20 } };
  },
  
  getOne: <T>(resource: string, id: number | string) => 
    fetchApi<T>(`/${resource}/${id}`),
    
  create: <T>(resource: string, data: any) => 
    fetchApi<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: <T>(resource: string, id: number | string, data: any) => 
    fetchApi<T>(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  remove: (resource: string, id: number | string) => 
    fetchApi<void>(`/${resource}/${id}`, {
      method: 'DELETE',
    }),
};

