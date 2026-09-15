<?php

namespace common\services;

use Yii;
use common\models\Attendance;
use common\models\Lesson;

class AttendanceService
{
    /**
     * Bulk save or update attendance for a lesson
     */
    public static function saveAttendance(int $lessonId, array $records): bool
    {
        $transaction = Yii::$app->db->beginTransaction();
        try {
            foreach ($records as $item) {
                $studentId = $item['student_id'] ?? null;
                $status = $item['status'] ?? Attendance::STATUS_PRESENT;
                $remarks = $item['remarks'] ?? null;

                if (!$studentId) {
                    continue;
                }

                $attendance = Attendance::findOne([
                    'lesson_id' => $lessonId,
                    'student_id' => $studentId,
                ]);

                if (!$attendance) {
                    $attendance = new Attendance();
                    $attendance->lesson_id = $lessonId;
                    $attendance->student_id = $studentId;
                }

                $attendance->status = (int) $status;
                $attendance->remarks = $remarks;
                $attendance->save(false);
            }

            // Update lesson status to completed if it was scheduled
            $lesson = Lesson::findOne($lessonId);
            if ($lesson && $lesson->status === 10) {
                $lesson->status = 30; // completed
                $lesson->save(false);
            }

            $transaction->commit();
            return true;
        } catch (\Throwable $e) {
            $transaction->rollBack();
            throw $e;
        }
    }
}
