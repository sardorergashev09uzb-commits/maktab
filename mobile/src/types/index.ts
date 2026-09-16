export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  avatar?: string;
  status: number;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Student {
  id: number;
  user_id: number;
  student_code: string;
  birth_date?: string;
  gender?: number;
  address?: string;
  status: number;
  user?: User;
  enrollments?: Enrollment[];
  currentEnrollment?: Enrollment;
}

export interface Teacher {
  id: number;
  user_id: number;
  employee_code: string;
  specialization?: string;
  education?: string;
  experience_years?: number;
  hire_date?: string;
  status: number;
  user?: User;
}

export interface SchoolClass {
  id: number;
  academic_year_id: number;
  name: string;
  grade_level: number;
  section?: string;
  room_id?: number;
  capacity?: number;
  status: number;
  academicYear?: AcademicYear;
  room?: Room;
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  status: number;
}

export interface AcademicYear {
  id: number;
  name: string;
  slug?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: number;
}

export interface Term {
  id: number;
  academic_year_id: number;
  name: string;
  order_number: number;
  start_date: string;
  end_date: string;
  status: number;
  academicYear?: AcademicYear;
}

export interface Room {
  id: number;
  name: string;
  building?: string;
  floor?: number;
  capacity?: number;
  type?: string;
  status: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  school_class_id: number;
  academic_year_id: number;
  enrolled_date?: string;
  status: number;
  student?: Student;
  schoolClass?: SchoolClass;
  academicYear?: AcademicYear;
}

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  school_class_id: number;
  academic_year_id: number;
  is_class_teacher: boolean;
  status: number;
  teacher?: Teacher;
  subject?: Subject;
  schoolClass?: SchoolClass;
  academicYear?: AcademicYear;
}

export interface ApiListResponse<T> {
  items: T[];
  _meta: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}

export interface AcademicCalendar {
  id: number;
  academic_year_id: number;
  date: string;
  type: 'school_day' | 'weekend' | 'holiday' | 'special_closure' | 'exam_period';
  title?: string;
  description?: string;
  is_working_day: boolean;
  academicYear?: AcademicYear;
}

export interface Schedule {
  id: number;
  academic_year_id: number;
  school_class_id: number;
  subject_id: number;
  teacher_id: number;
  room_id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: number;
  schoolClass?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  academicYear?: AcademicYear;
}

export interface Lesson {
  id: number;
  schedule_id?: number;
  academic_year_id: number;
  school_class_id: number;
  subject_id: number;
  teacher_id: number;
  room_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  topic?: string;
  notes?: string;
  status: number;
  schoolClass?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  attendances?: Attendance[];
  grades?: Grade[];
  gradeOverrides?: GradeOverride[];
}

export interface Attendance {
  id: number;
  lesson_id: number;
  student_id: number;
  status: number;
  remarks?: string;
  student?: Student;
  lesson?: Lesson;
}

export interface GradingPolicy {
  id: number;
  name: string;
  deadline_hours: number;
  exclude_weekends: boolean;
  exclude_holidays: boolean;
  allow_zavuch_override: boolean;
  status: number;
}

export interface GradeCategory {
  id: number;
  name: string;
  code: string;
  weight: number;
  max_score: number;
  status: number;
}

export interface Grade {
  id: number;
  lesson_id: number;
  student_id: number;
  teacher_id: number;
  grade_category_id: number;
  score: number;
  max_score: number;
  comment?: string;
  status: number;
  student?: Student;
  teacher?: Teacher;
  gradeCategory?: GradeCategory;
  lesson?: Lesson;
}

export interface GradeOverride {
  id: number;
  lesson_id: number;
  student_id: number;
  teacher_id: number;
  grade_category_id: number;
  requested_score: number;
  reason: string;
  zavuch_id?: number;
  status: number;
  decision_notes?: string;
  decided_at?: number;
  student?: Student;
  teacher?: Teacher;
  gradeCategory?: GradeCategory;
  lesson?: Lesson;
  zavuch?: User;
}

export interface DeadlineInfo {
  status: 'allowed' | 'expired' | 'override_requested' | 'override_approved' | 'override_rejected';
  label: string;
  is_open: boolean;
  deadline_at: number;
  override?: GradeOverride | null;
}

export interface Assignment {
  id: number;
  lesson_id?: number;
  school_class_id: number;
  subject_id: number;
  teacher_id: number;
  title: string;
  description: string;
  attachment_url?: string;
  due_date: string;
  max_score: number;
  status: number;
  schoolClass?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
  submissions?: Submission[];
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  text_content?: string;
  file_url?: string;
  submitted_at: number;
  score?: number;
  teacher_feedback?: string;
  status: number; // 10=submitted, 20=graded, 30=returned
  student?: Student;
  assignment?: Assignment;
}

export interface QuestionBank {
  id: number;
  subject_id: number;
  teacher_id: number;
  title: string;
  description?: string;
  status: number;
  subject?: Subject;
  teacher?: Teacher;
  questions?: Question[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order_number: number;
}

export interface Question {
  id: number;
  question_bank_id?: number;
  subject_id: number;
  question_text: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_text' | 'formula' | 'image';
  points: number;
  difficulty: number;
  image_url?: string;
  formula?: string;
  explanation?: string;
  status: number;
  options?: QuestionOption[];
  subject?: Subject;
  questionBank?: QuestionBank;
}

export interface Exam {
  id: number;
  academic_year_id: number;
  school_class_id: number;
  subject_id: number;
  teacher_id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  passing_score: number;
  max_score: number;
  shuffle_questions: boolean;
  status: number; // 10=draft, 20=published, 30=active, 40=completed
  schoolClass?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
  questions?: Question[];
  examAttempts?: ExamAttempt[];
}

export interface ExamAnswer {
  id: number;
  exam_attempt_id: number;
  question_id: number;
  selected_option_id?: number;
  text_answer?: string;
  score_awarded: number;
  is_correct: boolean;
  question?: Question;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  started_at: number;
  finished_at?: number;
  total_score: number;
  passed: boolean;
  status: number; // 10=in_progress, 20=submitted, 30=graded
  exam?: Exam;
  student?: Student;
  answers?: ExamAnswer[];
}

export interface Contract {
  id: number;
  contract_number: string;
  student_id: number;
  parent_id?: number;
  academic_year_id: number;
  total_amount: number;
  discount_amount: number;
  paid_amount: number;
  payment_plan: 'monthly' | 'quarterly' | 'annual';
  start_date: string;
  end_date: string;
  notes?: string;
  status: number; // 10=active, 20=completed, 30=terminated
  student?: Student;
  parent?: any;
  academicYear?: AcademicYear;
  invoices?: Invoice[];
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: number;
  contract_id?: number;
  student_id: number;
  invoice_number: string;
  title: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: number; // 10=pending, 20=partially_paid, 30=paid, 40=overdue, 50=cancelled
  notes?: string;
  contract?: Contract;
  student?: Student;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'click' | 'payme' | 'uzum' | 'bank_transfer';
  transaction_reference?: string;
  notes?: string;
  status: number; // 10=confirmed, 20=reversed
  reversed_at?: number;
  reversed_by?: number;
  reversal_reason?: string;
  invoice?: Invoice;
  student?: Student;
  reversedByUser?: User;
}

export interface CoinRule {
  id: number;
  title: string;
  code: string;
  coins_amount: number;
  description?: string;
  is_active: boolean;
}

export interface CoinTransaction {
  id: number;
  student_id: number;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  reference_type?: string;
  reference_id?: number;
  created_by?: number;
  created_at: number;
  student?: Student;
  createdByUser?: User;
}

export interface CoinReward {
  id: number;
  title: string;
  description?: string;
  coins_cost: number;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
}

export interface RewardRedemption {
  id: number;
  student_id: number;
  coin_reward_id: number;
  coins_spent: number;
  status: number; // 10=pending, 20=delivered, 30=cancelled
  delivered_at?: number;
  student?: Student;
  reward?: CoinReward;
}

export interface FinancialStats {
  total_contracted: number;
  total_collected: number;
  total_debt: number;
  overdue_invoices_count: number;
  recent_payments: Payment[];
}

export interface Achievement {
  id: number;
  title: string;
  description?: string;
  category: 'academic' | 'sport' | 'creative' | 'discipline';
  badge_color: string;
  icon: string;
  coin_reward: number;
  is_active: boolean;
  studentAchievements?: StudentAchievement[];
}

export interface StudentAchievement {
  id: number;
  student_id: number;
  achievement_id: number;
  awarded_date: string;
  notes?: string;
  awarded_by?: number;
  created_at: number;
  student?: Student;
  achievement?: Achievement;
  awardedByUser?: User;
}

export interface Certificate {
  id: number;
  student_id: number;
  title: string;
  issuer: string;
  issue_date: string;
  file_url?: string;
  verification_code?: string;
  status: number; // 10=pending, 20=verified, 30=rejected
  reviewed_by?: number;
  review_notes?: string;
  reviewed_at?: number;
  student?: Student;
  reviewedByUser?: User;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target_role: 'all' | 'teachers' | 'students' | 'parents';
  priority: 'normal' | 'high' | 'urgent';
  is_published: boolean;
  author_id?: number;
  published_at: number;
  expires_at?: number;
  author?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'grade' | 'attendance' | 'payment' | 'achievement' | 'announcement' | 'general';
  link_url?: string;
  is_read: boolean;
  read_at?: number;
  created_at: number;
}

export interface CoinLeaderboardItem {
  student_id: number;
  total_coins: number;
  student_code: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface StudentPortalData {
  student: Student;
  today_lessons: Lesson[];
  schedule: Schedule[];
  recent_grades: Grade[];
  assignments: Assignment[];
  coin_balance: number;
  achievements: StudentAchievement[];
  announcements: Announcement[];
}

export interface ParentPortalData {
  parent: any;
  children: Student[];
  selected_child: Student;
  attendance_stats: {
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  recent_grades: Grade[];
  invoices: Invoice[];
  total_debt: number;
  announcements: Announcement[];
}

export interface TeacherPortalData {
  teacher: Teacher;
  today_lessons: Lesson[];
  pending_submissions: Submission[];
  teacher_assignments: TeacherAssignment[];
  announcements: Announcement[];
}

export interface SurveyDimension {
  id: number;
  survey_id: number;
  name: string;
  code: string;
  description?: string;
  color_code?: string;
  recommendation_text?: string;
  order_number: number;
}

export interface SurveyOption {
  id: number;
  survey_question_id: number;
  option_text: string;
  dimension_id?: number;
  weight: number;
  order_number: number;
  dimension?: SurveyDimension;
}

export interface SurveyQuestion {
  id: number;
  survey_id: number;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'rating_scale' | 'text';
  order_number: number;
  is_required: boolean;
  options?: SurveyOption[];
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  type: 'career_guidance' | 'interest_diagnostic' | 'teacher_eval' | 'school_eval' | 'custom';
  target_role: 'student' | 'parent' | 'teacher' | 'all';
  academic_year_id?: number;
  start_date?: string;
  end_date?: string;
  is_anonymous: boolean;
  status: number;
  created_at: number;
  dimensions?: SurveyDimension[];
  questions?: SurveyQuestion[];
}

export interface DimensionScore {
  dimension_id: number;
  code: string;
  name: string;
  color_code: string;
  score: number;
  percentage: number;
}

export interface SurveyResponse {
  id: number;
  survey_id: number;
  user_id?: number;
  target_teacher_id?: number;
  submitted_at: number;
  dimension_scores?: DimensionScore[] | string;
  primary_dimension_id?: number;
  recommendation?: string;
  status: number;
  survey?: Survey;
  primaryDimension?: SurveyDimension;
}

export interface SurveyAnalytics {
  survey: {
    id: number;
    title: string;
    type: string;
    target_role: string;
    is_anonymous: boolean;
  };
  total_responses: number;
  dimensions: {
    dimension_id: number;
    name: string;
    code: string;
    color_code: string;
    primary_count: number;
    percentage: number;
  }[];
  ratings: {
    question_id: number;
    question_text: string;
    average_rating: number;
  }[];
  recent_feedback: {
    text_answer: string;
    created_at: number;
  }[];
}

export interface AdmissionApplication {
  id: number;
  application_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date?: string;
  gender?: number;
  applying_grade: number;
  academic_year_id?: number;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  address?: string;
  previous_school?: string;
  status: 'new' | 'contacted' | 'interview' | 'exam' | 'accepted' | 'rejected' | 'enrolled';
  interview_date?: string;
  interview_notes?: string;
  exam_score?: number;
  notes?: string;
  source?: string;
  enrolled_student_id?: number;
  created_at: number;
  updated_at: number;
  academicYear?: AcademicYear;
  enrolledStudent?: Student;
}

export interface AdmissionFunnelStats {
  total_applications: number;
  counts: {
    new: number;
    contacted: number;
    interview: number;
    exam: number;
    accepted: number;
    rejected: number;
    enrolled: number;
  };
  conversion_rate: number;
}

export interface CmsSection {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  content?: any;
  image_url?: string;
  is_active: boolean;
  order_number: number;
}

export interface CmsFaq {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_number: number;
  is_active: boolean;
}

export interface CmsPublicData {
  sections: Record<string, {
    id?: number;
    title: string;
    subtitle?: string;
    content?: any;
    image_url?: string;
  }>;
  faqs: CmsFaq[];
  settings?: Record<string, string>;
  live_stats?: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_subjects: number;
    total_rooms: number;
    total_parents: number;
    total_applications: number;
    total_achievements: number;
    teacher_student_ratio: string;
    average_class_capacity: number;
    classes_by_program: {
      primary: number;
      middle: number;
      high: number;
    };
    popular_subjects: string[];
    academic_year: string;
    grades: number[];
  };
}

export interface SystemSetting {
  id: number;
  key: string;
  value?: string;
  title: string;
  description?: string;
  group: 'general' | 'academic' | 'finance' | 'notification' | string;
  type: 'string' | 'number' | 'boolean' | 'json' | string;
  created_at: number;
  updated_at: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  model?: string;
  model_id?: number;
  details?: string;
  ip_address?: string;
  created_at: number;
  user?: User;
}

export interface DirectorKpi {
  overview: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_capacity: number;
    capacity_rate: number;
  };
  attendance: {
    overall_rate: number;
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  academic: {
    average_score: number;
    top_classes: {
      id: number;
      name: string;
      grade_level: number;
      avg_score: number;
      student_count: number;
    }[];
    top_subjects: {
      id: number;
      name: string;
      code: string;
      avg_score: number;
      total_grades: number;
    }[];
  };
  finance: {
    total_contracted: number;
    total_collected: number;
    total_debt: number;
    collection_rate: number;
    overdue_count: number;
    monthly_revenue: {
      month: string;
      total: number;
    }[];
  };
  admissions: AdmissionFunnelStats;
}

export interface AcademicKpi {
  overrides: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    approval_rate: number;
  };
  exams: {
    total_exams: number;
    total_attempts: number;
    passing_rate: number;
    average_score: number;
  };
  teachers_activity: {
    id: number;
    employee_code: string;
    name: string;
    specialization?: string;
    lessons_count: number;
    grades_count: number;
    avg_score: number;
  }[];
  categories: {
    name: string;
    code: string;
    count: number;
    avg_score: number;
  }[];
  career_distribution: {
    id: number;
    name: string;
    color_code?: string;
    count: number;
  }[];
}

export interface FinancialAnalytics {
  summary: FinancialStats;
  payment_methods: {
    payment_method: string;
    count: number;
    total: number;
  }[];
  debtors: {
    student_id: number;
    student_code: string;
    student_name: string;
    phone?: string;
    class_name?: string;
    contract_id?: number;
    total_debt: number;
    overdue_invoices: number;
  }[];
}



