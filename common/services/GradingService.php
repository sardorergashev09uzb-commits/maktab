<?php

namespace common\services;

use Yii;
use common\models\Lesson;
use common\models\Grade;
use common\models\GradeOverride;
use common\models\GradingPolicy;
use common\models\User;
use yii\web\ForbiddenHttpException;

class GradingService
{
    /**
     * Get deadline information and grading accessibility status for a lesson
     */
    public static function getDeadlineStatus(Lesson $lesson, ?int $studentId = null): array
    {
        $policy = GradingPolicy::find()->where(['status' => 10])->one();
        $deadlineAt = CalendarService::calculateDeadline($lesson->date, $lesson->end_time, $policy, $lesson->academic_year_id);
        $isExpired = time() > $deadlineAt;

        // Check if there is an override
        $overrideQuery = GradeOverride::find()
            ->where(['lesson_id' => $lesson->id]);
        if ($studentId) {
            $overrideQuery->andWhere(['student_id' => $studentId]);
        }
        /** @var GradeOverride|null $override */
        $override = $overrideQuery->orderBy(['id' => SORT_DESC])->one();

        if (!$isExpired) {
            return [
                'status' => 'allowed',
                'label' => 'Ruxsat berilgan',
                'is_open' => true,
                'deadline_at' => $deadlineAt,
                'override' => null,
            ];
        }

        if ($override) {
            if ($override->status === GradeOverride::STATUS_APPROVED) {
                return [
                    'status' => 'override_approved',
                    'label' => 'Zavuch tasdiqlagan',
                    'is_open' => true,
                    'deadline_at' => $deadlineAt,
                    'override' => $override,
                ];
            }
            if ($override->status === GradeOverride::STATUS_PENDING) {
                return [
                    'status' => 'override_requested',
                    'label' => 'Ruxsat so\'ralgan',
                    'is_open' => false,
                    'deadline_at' => $deadlineAt,
                    'override' => $override,
                ];
            }
            if ($override->status === GradeOverride::STATUS_REJECTED) {
                return [
                    'status' => 'override_rejected',
                    'label' => 'Ruxsat rad etilgan',
                    'is_open' => false,
                    'deadline_at' => $deadlineAt,
                    'override' => $override,
                ];
            }
        }

        return [
            'status' => 'expired',
            'label' => 'Muddati o\'tgan',
            'is_open' => false,
            'deadline_at' => $deadlineAt,
            'override' => null,
        ];
    }

    /**
     * Submit a Zavuch override request
     */
    public static function requestOverride(int $lessonId, int $studentId, int $teacherId, int $categoryId, float $requestedScore, string $reason): GradeOverride
    {
        $override = new GradeOverride();
        $override->lesson_id = $lessonId;
        $override->student_id = $studentId;
        $override->teacher_id = $teacherId;
        $override->grade_category_id = $categoryId;
        $override->requested_score = $requestedScore;
        $override->reason = $reason;
        $override->status = GradeOverride::STATUS_PENDING;

        if (!$override->save()) {
            throw new \Exception(implode(', ', $override->getFirstErrors()));
        }

        return $override;
    }

    /**
     * Approve a Zavuch override and apply the requested grade
     */
    public static function approveOverride(int $overrideId, int $zavuchId, ?string $notes = null): Grade
    {
        $override = GradeOverride::findOne($overrideId);
        if (!$override) {
            throw new \Exception('So\'rov topilmadi');
        }

        $override->status = GradeOverride::STATUS_APPROVED;
        $override->zavuch_id = $zavuchId;
        $override->decision_notes = $notes;
        $override->decided_at = time();
        $override->save(false);

        // Apply grade
        $grade = Grade::findOne([
            'lesson_id' => $override->lesson_id,
            'student_id' => $override->student_id,
            'grade_category_id' => $override->grade_category_id,
        ]);

        if (!$grade) {
            $grade = new Grade();
            $grade->lesson_id = $override->lesson_id;
            $grade->student_id = $override->student_id;
            $grade->teacher_id = $override->teacher_id;
            $grade->grade_category_id = $override->grade_category_id;
        }

        $grade->score = $override->requested_score;
        $grade->status = 20; // submitted
        $grade->comment = "Zavuch ruxsati bilan: " . $override->reason;
        $grade->save(false);

        return $grade;
    }

    /**
     * Reject a Zavuch override
     */
    public static function rejectOverride(int $overrideId, int $zavuchId, ?string $notes = null): GradeOverride
    {
        $override = GradeOverride::findOne($overrideId);
        if (!$override) {
            throw new \Exception('So\'rov topilmadi');
        }

        $override->status = GradeOverride::STATUS_REJECTED;
        $override->zavuch_id = $zavuchId;
        $override->decision_notes = $notes;
        $override->decided_at = time();
        $override->save(false);

        return $override;
    }
}
