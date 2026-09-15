<?php

namespace common\services;

use Yii;
use common\models\Student;
use common\models\Teacher;
use common\models\SchoolClass;
use common\models\Subject;
use common\models\Grade;
use common\models\Attendance;
use common\models\GradeOverride;
use common\models\Exam;
use common\models\ExamAttempt;
use common\models\Contract;
use common\models\Invoice;
use common\models\Payment;
use common\models\AdmissionApplication;
use common\models\SurveyResponse;
use common\models\SurveyDimension;

class AnalyticsService
{
    /**
     * Executive KPI for School Director
     */
    public function getDirectorDashboard()
    {
        // 1. General Counts & Capacity
        $totalStudents = (int)Student::find()->where(['status' => Student::STATUS_ACTIVE])->count();
        $totalTeachers = (int)Teacher::find()->where(['status' => 10])->count();
        $totalClasses = (int)SchoolClass::find()->where(['status' => 10])->count();
        $totalCapacity = (int)SchoolClass::find()->where(['status' => 10])->sum('capacity') ?: 100;
        $capacityRate = $totalCapacity > 0 ? round(($totalStudents / $totalCapacity) * 100, 1) : 0;

        // 2. Attendance Overview
        $attendanceTotal = (int)Attendance::find()->count();
        $presentCount = (int)Attendance::find()->where(['status' => Attendance::STATUS_PRESENT])->count();
        $lateCount = (int)Attendance::find()->where(['status' => Attendance::STATUS_LATE])->count();
        $absentCount = (int)Attendance::find()->where(['status' => Attendance::STATUS_ABSENT])->count();
        $excusedCount = (int)Attendance::find()->where(['status' => Attendance::STATUS_EXCUSED])->count();

        $attendanceRate = $attendanceTotal > 0
            ? round((($presentCount + $lateCount) / $attendanceTotal) * 100, 1)
            : 100.0;

        // 3. Academic GPA
        $avgScore = (float)Grade::find()->average('score') ?: 0;
        $averageGpa = round($avgScore, 1);

        // Top Classes by average score
        $topClasses = (new \yii\db\Query())
            ->select([
                'c.id',
                'c.name',
                'c.grade_level',
                'avg_score' => 'ROUND(AVG(g.score), 1)',
                'student_count' => 'COUNT(DISTINCT e.student_id)'
            ])
            ->from('{{%school_class}} c')
            ->innerJoin('{{%lesson}} l', 'l.school_class_id = c.id')
            ->innerJoin('{{%grade}} g', 'g.lesson_id = l.id')
            ->leftJoin('{{%enrollment}} e', 'e.school_class_id = c.id AND e.status = 10')
            ->groupBy(['c.id', 'c.name', 'c.grade_level'])
            ->orderBy(['avg_score' => SORT_DESC])
            ->limit(5)
            ->all();

        // Top Subjects by average score
        $topSubjects = (new \yii\db\Query())
            ->select([
                's.id',
                's.name',
                's.code',
                'avg_score' => 'ROUND(AVG(g.score), 1)',
                'total_grades' => 'COUNT(g.id)'
            ])
            ->from('{{%subject}} s')
            ->innerJoin('{{%lesson}} l', 'l.subject_id = s.id')
            ->innerJoin('{{%grade}} g', 'g.lesson_id = l.id')
            ->groupBy(['s.id', 's.name', 's.code'])
            ->orderBy(['avg_score' => SORT_DESC])
            ->limit(5)
            ->all();

        // 4. Financial KPI
        $financeService = new FinanceService();
        $finStats = $financeService->getFinancialStats();
        $collectionRate = $finStats['total_contracted'] > 0
            ? round(($finStats['total_collected'] / $finStats['total_contracted']) * 100, 1)
            : 0;

        // Monthly Collection Dynamics (Last 6 months)
        $monthlyRevenue = (new \yii\db\Query())
            ->select([
                'month' => "DATE_FORMAT(payment_date, '%Y-%m')",
                'total' => 'SUM(amount)'
            ])
            ->from('{{%payment}}')
            ->where(['status' => 10])
            ->groupBy(["DATE_FORMAT(payment_date, '%Y-%m')"])
            ->orderBy(['month' => SORT_ASC])
            ->limit(6)
            ->all();

        // 5. Admissions Funnel
        $admissionService = new AdmissionService();
        $admissionStats = $admissionService->getFunnelStats();

        return [
            'overview' => [
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_classes' => $totalClasses,
                'total_capacity' => $totalCapacity,
                'capacity_rate' => $capacityRate,
            ],
            'attendance' => [
                'overall_rate' => $attendanceRate,
                'total' => $attendanceTotal,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
                'excused' => $excusedCount,
            ],
            'academic' => [
                'average_score' => $averageGpa,
                'top_classes' => $topClasses,
                'top_subjects' => $topSubjects,
            ],
            'finance' => [
                'total_contracted' => $finStats['total_contracted'],
                'total_collected' => $finStats['total_collected'],
                'total_debt' => $finStats['total_debt'],
                'collection_rate' => $collectionRate,
                'overdue_count' => $finStats['overdue_invoices_count'],
                'monthly_revenue' => $monthlyRevenue,
            ],
            'admissions' => $admissionStats,
        ];
    }

    /**
     * Academic Director (Zavuch) Analytics
     */
    public function getAcademicAnalytics()
    {
        // 1. Grade Overrides
        $totalOverrides = (int)GradeOverride::find()->count();
        $approvedOverrides = (int)GradeOverride::find()->where(['status' => GradeOverride::STATUS_APPROVED])->count();
        $pendingOverrides = (int)GradeOverride::find()->where(['status' => GradeOverride::STATUS_PENDING])->count();
        $rejectedOverrides = (int)GradeOverride::find()->where(['status' => GradeOverride::STATUS_REJECTED])->count();

        // 2. Exam Performance
        $totalExams = (int)Exam::find()->count();
        $totalAttempts = (int)ExamAttempt::find()->count();
        $passedAttempts = (int)ExamAttempt::find()->where(['passed' => true])->count();
        $examPassingRate = $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100, 1) : 0;
        $examAvgScore = (float)ExamAttempt::find()->average('total_score') ?: 0;

        // 3. Teacher grading activity & performance
        $teacherActivity = (new \yii\db\Query())
            ->select([
                't.id',
                't.employee_code',
                'name' => "CONCAT(u.first_name, ' ', u.last_name)",
                'specialization' => 't.specialization',
                'lessons_count' => 'COUNT(DISTINCT l.id)',
                'grades_count' => 'COUNT(DISTINCT g.id)',
                'avg_score' => 'ROUND(AVG(g.score), 1)'
            ])
            ->from('{{%teacher}} t')
            ->innerJoin('{{%user}} u', 'u.id = t.user_id')
            ->leftJoin('{{%lesson}} l', 'l.teacher_id = t.id')
            ->leftJoin('{{%grade}} g', 'g.teacher_id = t.id')
            ->groupBy(['t.id', 't.employee_code', 'u.first_name', 'u.last_name', 't.specialization'])
            ->orderBy(['grades_count' => SORT_DESC])
            ->limit(10)
            ->all();

        // 4. Grade categories distribution
        $categoriesStats = (new \yii\db\Query())
            ->select([
                'c.name',
                'c.code',
                'count' => 'COUNT(g.id)',
                'avg_score' => 'ROUND(AVG(g.score), 1)'
            ])
            ->from('{{%grade_category}} c')
            ->leftJoin('{{%grade}} g', 'g.grade_category_id = c.id')
            ->groupBy(['c.id', 'c.name', 'c.code'])
            ->all();

        // 5. Student Career Interest Distribution (Holland & STEM models)
        $careerDistribution = (new \yii\db\Query())
            ->select([
                'd.id',
                'd.name',
                'd.color_code',
                'count' => 'COUNT(r.id)'
            ])
            ->from('{{%survey_dimension}} d')
            ->leftJoin('{{%survey_response}} r', 'r.primary_dimension_id = d.id')
            ->groupBy(['d.id', 'd.name', 'd.color_code'])
            ->orderBy(['count' => SORT_DESC])
            ->all();

        return [
            'overrides' => [
                'total' => $totalOverrides,
                'approved' => $approvedOverrides,
                'pending' => $pendingOverrides,
                'rejected' => $rejectedOverrides,
                'approval_rate' => $totalOverrides > 0 ? round(($approvedOverrides / $totalOverrides) * 100, 1) : 0,
            ],
            'exams' => [
                'total_exams' => $totalExams,
                'total_attempts' => $totalAttempts,
                'passing_rate' => $examPassingRate,
                'average_score' => round($examAvgScore, 1),
            ],
            'teachers_activity' => $teacherActivity,
            'categories' => $categoriesStats,
            'career_distribution' => $careerDistribution,
        ];
    }

    /**
     * Financial Analytics for Accountant
     */
    public function getFinancialAnalytics()
    {
        $financeService = new FinanceService();
        $finStats = $financeService->getFinancialStats();

        // Payment Methods Breakdown
        $methods = (new \yii\db\Query())
            ->select([
                'payment_method',
                'count' => 'COUNT(id)',
                'total' => 'SUM(amount)'
            ])
            ->from('{{%payment}}')
            ->where(['status' => 10])
            ->groupBy(['payment_method'])
            ->orderBy(['total' => SORT_DESC])
            ->all();

        // Debtors List (Students with overdue/unpaid balances)
        $debtors = (new \yii\db\Query())
            ->select([
                'student_id' => 's.id',
                'student_code' => 's.student_code',
                'student_name' => "CONCAT(u.first_name, ' ', u.last_name)",
                'phone' => 'u.phone',
                'class_name' => 'c.name',
                'contract_id' => 'k.id',
                'total_debt' => 'SUM(i.amount - i.paid_amount)',
                'overdue_invoices' => "SUM(CASE WHEN i.status = 40 OR (i.due_date < CURDATE() AND i.status IN (10, 20)) THEN 1 ELSE 0 END)"
            ])
            ->from('{{%invoice}} i')
            ->innerJoin('{{%student}} s', 's.id = i.student_id')
            ->innerJoin('{{%user}} u', 'u.id = s.user_id')
            ->leftJoin('{{%contract}} k', 'k.id = i.contract_id')
            ->leftJoin('{{%enrollment}} e', 'e.student_id = s.id AND e.status = 10')
            ->leftJoin('{{%school_class}} c', 'c.id = e.school_class_id')
            ->where(['IN', 'i.status', [10, 20, 40]])
            ->groupBy(['s.id', 's.student_code', 'u.first_name', 'u.last_name', 'u.phone', 'c.name', 'k.id'])
            ->having('total_debt > 0')
            ->orderBy(['total_debt' => SORT_DESC])
            ->limit(20)
            ->all();

        return [
            'summary' => $finStats,
            'payment_methods' => $methods,
            'debtors' => $debtors,
        ];
    }

    /**
     * Export raw data as UTF-8 CSV
     */
    public function exportCsv($type)
    {
        $output = "\xEF\xBB\xBF"; // UTF-8 BOM for Microsoft Excel

        switch ($type) {
            case 'students':
                $output .= "ID,O'quvchi Kodi,F.I.Sh,Telefon,Sinf,Jinsi,Status,Qabul Sanasi\n";
                $students = (new \yii\db\Query())
                    ->select([
                        's.id',
                        's.student_code',
                        'name' => "CONCAT(u.first_name, ' ', u.last_name)",
                        'u.phone',
                        'class_name' => 'c.name',
                        's.gender',
                        's.status',
                        's.admission_date'
                    ])
                    ->from('{{%student}} s')
                    ->innerJoin('{{%user}} u', 'u.id = s.user_id')
                    ->leftJoin('{{%enrollment}} e', 'e.student_id = s.id AND e.status = 10')
                    ->leftJoin('{{%school_class}} c', 'c.id = e.school_class_id')
                    ->orderBy(['s.id' => SORT_ASC])
                    ->all();

                foreach ($students as $s) {
                    $line = [
                        $s['id'],
                        $s['student_code'],
                        $s['name'],
                        $s['phone'],
                        $s['class_name'] ?: 'Biriktirilmagan',
                        $s['gender'] == 1 ? "O'g'il bola" : "Qiz bola",
                        $s['status'] == 10 ? 'Faol' : 'Nofaol',
                        $s['admission_date'] ?: '-'
                    ];
                    $output .= implode(',', array_map(function ($val) {
                        return '"' . str_replace('"', '""', (string)$val) . '"';
                    }, $line)) . "\n";
                }
                break;

            case 'grades':
                $output .= "ID,O'quvchi,Sinf,Fan,Kategoriya,Baho,Maksimal Ball,O'qituvchi,Sana\n";
                $grades = (new \yii\db\Query())
                    ->select([
                        'g.id',
                        'student' => "CONCAT(su.first_name, ' ', su.last_name)",
                        'class_name' => 'c.name',
                        'subject' => 'sub.name',
                        'category' => 'gc.name',
                        'g.score',
                        'g.max_score',
                        'teacher' => "CONCAT(tu.first_name, ' ', tu.last_name)",
                        'l.date'
                    ])
                    ->from('{{%grade}} g')
                    ->innerJoin('{{%student}} s', 's.id = g.student_id')
                    ->innerJoin('{{%user}} su', 'su.id = s.user_id')
                    ->innerJoin('{{%lesson}} l', 'l.id = g.lesson_id')
                    ->innerJoin('{{%school_class}} c', 'c.id = l.school_class_id')
                    ->innerJoin('{{%subject}} sub', 'sub.id = l.subject_id')
                    ->innerJoin('{{%grade_category}} gc', 'gc.id = g.grade_category_id')
                    ->innerJoin('{{%teacher}} t', 't.id = g.teacher_id')
                    ->innerJoin('{{%user}} tu', 'tu.id = t.user_id')
                    ->orderBy(['g.id' => SORT_DESC])
                    ->limit(500)
                    ->all();

                foreach ($grades as $row) {
                    $output .= implode(',', array_map(function ($val) {
                        return '"' . str_replace('"', '""', (string)$val) . '"';
                    }, $row)) . "\n";
                }
                break;

            case 'attendance':
                $output .= "ID,O'quvchi,Sinf,Fan,Sana,Holat,Izoh\n";
                $attendances = (new \yii\db\Query())
                    ->select([
                        'a.id',
                        'student' => "CONCAT(su.first_name, ' ', su.last_name)",
                        'class_name' => 'c.name',
                        'subject' => 'sub.name',
                        'l.date',
                        'a.status',
                        'a.remarks'
                    ])
                    ->from('{{%attendance}} a')
                    ->innerJoin('{{%student}} s', 's.id = a.student_id')
                    ->innerJoin('{{%user}} su', 'su.id = s.user_id')
                    ->innerJoin('{{%lesson}} l', 'l.id = a.lesson_id')
                    ->innerJoin('{{%school_class}} c', 'c.id = l.school_class_id')
                    ->innerJoin('{{%subject}} sub', 'sub.id = l.subject_id')
                    ->orderBy(['a.id' => SORT_DESC])
                    ->limit(500)
                    ->all();

                $statusMap = [1 => 'Qatnashdi', 2 => 'Kechikdi', 3 => 'Kelmadi', 4 => 'Sababli'];
                foreach ($attendances as $a) {
                    $line = [
                        $a['id'],
                        $a['student'],
                        $a['class_name'],
                        $a['subject'],
                        $a['date'],
                        $statusMap[$a['status']] ?? 'Noma\'lum',
                        $a['remarks'] ?: ''
                    ];
                    $output .= implode(',', array_map(function ($val) {
                        return '"' . str_replace('"', '""', (string)$val) . '"';
                    }, $line)) . "\n";
                }
                break;

            case 'debtors':
                $output .= "O'quvchi Kodi,F.I.Sh,Telefon,Sinf,Jami Qarz (UZS),Muddati O'tgan Invoyslar Soni\n";
                $fin = $this->getFinancialAnalytics();
                foreach ($fin['debtors'] as $row) {
                    $line = [
                        $row['student_code'],
                        $row['student_name'],
                        $row['phone'],
                        $row['class_name'] ?: 'Sinfi yo\'q',
                        number_format($row['total_debt'], 0, '.', ' '),
                        $row['overdue_invoices']
                    ];
                    $output .= implode(',', array_map(function ($val) {
                        return '"' . str_replace('"', '""', (string)$val) . '"';
                    }, $line)) . "\n";
                }
                break;

            case 'exams':
                $output .= "ID,Imtihon Nomi,Fan,Sinf,O'quvchi,To'plangan Ball,Maksimal Ball,Natija\n";
                $attempts = (new \yii\db\Query())
                    ->select([
                        'ea.id',
                        'exam_title' => 'e.title',
                        'subject' => 'sub.name',
                        'class_name' => 'c.name',
                        'student' => "CONCAT(u.first_name, ' ', u.last_name)",
                        'ea.total_score',
                        'e.max_score',
                        'ea.passed'
                    ])
                    ->from('{{%exam_attempt}} ea')
                    ->innerJoin('{{%exam}} e', 'e.id = ea.exam_id')
                    ->innerJoin('{{%subject}} sub', 'sub.id = e.subject_id')
                    ->innerJoin('{{%school_class}} c', 'c.id = e.school_class_id')
                    ->innerJoin('{{%student}} s', 's.id = ea.student_id')
                    ->innerJoin('{{%user}} u', 'u.id = s.user_id')
                    ->orderBy(['ea.id' => SORT_DESC])
                    ->limit(500)
                    ->all();

                foreach ($attempts as $ea) {
                    $line = [
                        $ea['id'],
                        $ea['exam_title'],
                        $ea['subject'],
                        $ea['class_name'],
                        $ea['student'],
                        $ea['total_score'],
                        $ea['max_score'],
                        $ea['passed'] ? 'O\'tdi' : 'O\'tmadi'
                    ];
                    $output .= implode(',', array_map(function ($val) {
                        return '"' . str_replace('"', '""', (string)$val) . '"';
                    }, $line)) . "\n";
                }
                break;

            default:
                $output .= "Tanlangan hisobot turi mavjud emas.\n";
                break;
        }

        return $output;
    }
}
