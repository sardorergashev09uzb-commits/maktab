<?php

namespace common\services;

use Yii;
use common\models\Student;
use common\models\ParentModel;
use common\models\Teacher;
use common\models\Lesson;
use common\models\Schedule;
use common\models\Grade;
use common\models\Attendance;
use common\models\Assignment;
use common\models\Submission;
use common\models\Invoice;
use common\models\StudentAchievement;
use common\models\Announcement;

class PortalService
{
    /**
     * Student portal dashboard data
     */
    public function getStudentDashboardData($studentId)
    {
        $student = Student::find()->where(['id' => $studentId])->with(['user', 'enrollments.schoolClass'])->one();
        if (!$student) {
            $student = Student::find()->with(['user', 'enrollments.schoolClass'])->one();
            if ($student) {
                $studentId = $student->id;
            }
        }

        $classId = null;
        if ($student && !empty($student->enrollments)) {
            $classId = $student->enrollments[0]->school_class_id;
        }

        // Today's lessons
        $today = date('Y-m-d');
        $lessonsQuery = Lesson::find()->with(['subject', 'teacher.user', 'room']);
        if ($classId) {
            $lessonsQuery->where(['school_class_id' => $classId, 'date' => $today]);
        } else {
            $lessonsQuery->where(['date' => $today]);
        }
        $todayLessons = $lessonsQuery->orderBy(['start_time' => SORT_ASC])->all();

        // If no lessons for today, get weekly schedule
        $schedule = [];
        if ($classId) {
            $schedule = Schedule::find()
                ->where(['school_class_id' => $classId])
                ->with(['subject', 'teacher.user', 'room'])
                ->orderBy(['day_of_week' => SORT_ASC, 'start_time' => SORT_ASC])
                ->all();
        }

        // Recent grades
        $recentGrades = Grade::find()
            ->where(['student_id' => $studentId])
            ->with(['lesson.subject', 'gradeCategory'])
            ->orderBy(['id' => SORT_DESC])
            ->limit(10)
            ->all();

        // Pending assignments
        $assignmentsQuery = Assignment::find()
            ->with(['subject', 'teacher.user'])
            ->where(['>=', 'due_date', date('Y-m-d H:i:s')])
            ->orderBy(['due_date' => SORT_ASC]);
        if ($classId) {
            $assignmentsQuery->andWhere(['school_class_id' => $classId]);
        }
        $assignments = $assignmentsQuery->limit(6)->all();

        // Coins balance
        $coinService = new CoinService();
        $coinBalance = $coinService->getBalance($studentId);

        // Achievements
        $achievements = StudentAchievement::find()
            ->where(['student_id' => $studentId])
            ->with(['achievement'])
            ->orderBy(['id' => SORT_DESC])
            ->all();

        // Announcements
        $announcements = Announcement::find()
            ->where(['is_published' => true])
            ->andWhere(['in', 'target_role', ['all', 'students']])
            ->orderBy(['priority' => SORT_DESC, 'published_at' => SORT_DESC])
            ->limit(5)
            ->all();

        return [
            'student' => $student,
            'today_lessons' => $todayLessons,
            'schedule' => $schedule,
            'recent_grades' => $recentGrades,
            'assignments' => $assignments,
            'coin_balance' => $coinBalance,
            'achievements' => $achievements,
            'announcements' => $announcements,
        ];
    }

    /**
     * Parent portal dashboard data
     */
    public function getParentDashboardData($parentId = null)
    {
        // Get parent or fallback
        $parent = null;
        if ($parentId) {
            $parent = ParentModel::findOne($parentId);
        }
        if (!$parent) {
            $parent = ParentModel::find()->one();
        }

        // Get children
        $students = [];
        if ($parent) {
            $students = $parent->getStudents()->with(['user', 'enrollments.schoolClass'])->all();
        }
        if (empty($students)) {
            $students = Student::find()->with(['user', 'enrollments.schoolClass'])->limit(3)->all();
        }

        $selectedStudent = !empty($students) ? $students[0] : null;
        $studentId = $selectedStudent ? $selectedStudent->id : null;

        // Attendance stats for the child
        $attendanceStats = [
            'present' => (int)Attendance::find()->where(['student_id' => $studentId, 'status' => Attendance::STATUS_PRESENT])->count(),
            'late' => (int)Attendance::find()->where(['student_id' => $studentId, 'status' => Attendance::STATUS_LATE])->count(),
            'absent' => (int)Attendance::find()->where(['student_id' => $studentId, 'status' => Attendance::STATUS_ABSENT])->count(),
            'excused' => (int)Attendance::find()->where(['student_id' => $studentId, 'status' => Attendance::STATUS_EXCUSED])->count(),
        ];

        // Child's recent grades
        $recentGrades = Grade::find()
            ->where(['student_id' => $studentId])
            ->with(['lesson.subject', 'gradeCategory'])
            ->orderBy(['id' => SORT_DESC])
            ->limit(8)
            ->all();

        // Invoices & debt
        $invoices = Invoice::find()
            ->where(['student_id' => $studentId])
            ->orderBy(['due_date' => SORT_DESC])
            ->all();

        $totalDebt = (float)Invoice::find()
            ->where(['student_id' => $studentId])
            ->andWhere(['in', 'status', [Invoice::STATUS_PENDING, Invoice::STATUS_PARTIALLY_PAID, Invoice::STATUS_OVERDUE]])
            ->sum('amount - paid_amount') ?: 0;

        // Announcements for parents
        $announcements = Announcement::find()
            ->where(['is_published' => true])
            ->andWhere(['in', 'target_role', ['all', 'parents']])
            ->orderBy(['priority' => SORT_DESC, 'published_at' => SORT_DESC])
            ->limit(5)
            ->all();

        return [
            'parent' => $parent,
            'children' => $students,
            'selected_child' => $selectedStudent,
            'attendance_stats' => $attendanceStats,
            'recent_grades' => $recentGrades,
            'invoices' => $invoices,
            'total_debt' => $totalDebt,
            'announcements' => $announcements,
        ];
    }

    /**
     * Teacher portal dashboard data
     */
    public function getTeacherDashboardData($teacherId = null)
    {
        $teacher = null;
        if ($teacherId) {
            $teacher = Teacher::findOne($teacherId);
        }
        if (!$teacher) {
            $teacher = Teacher::find()->with(['user'])->one();
        }

        $teacherId = $teacher ? $teacher->id : null;

        // Today's lessons
        $today = date('Y-m-d');
        $todayLessons = Lesson::find()
            ->where(['teacher_id' => $teacherId, 'date' => $today])
            ->with(['schoolClass', 'subject', 'room', 'attendances'])
            ->orderBy(['start_time' => SORT_ASC])
            ->all();

        // Pending submissions to grade
        $pendingSubmissions = Submission::find()
            ->innerJoinWith(['assignment'])
            ->where(['assignment.teacher_id' => $teacherId, 'submission.status' => Submission::STATUS_SUBMITTED])
            ->with(['assignment.subject', 'student.user'])
            ->limit(10)
            ->all();

        // Teacher assignments (classes and subjects taught)
        $assignments = [];
        if ($teacher) {
            $assignments = $teacher->getTeacherAssignments()
                ->with(['schoolClass', 'subject'])
                ->all();
        }

        // Announcements for teachers
        $announcements = Announcement::find()
            ->where(['is_published' => true])
            ->andWhere(['in', 'target_role', ['all', 'teachers']])
            ->orderBy(['priority' => SORT_DESC, 'published_at' => SORT_DESC])
            ->limit(5)
            ->all();

        return [
            'teacher' => $teacher,
            'today_lessons' => $todayLessons,
            'pending_submissions' => $pendingSubmissions,
            'teacher_assignments' => $assignments,
            'announcements' => $announcements,
        ];
    }
}
