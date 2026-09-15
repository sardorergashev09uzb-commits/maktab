<?php

namespace common\services;

use Yii;
use common\models\Assignment;
use common\models\Submission;
use yii\web\NotFoundHttpException;

class LmsService
{
    /**
     * Submit or re-submit homework
     */
    public static function submitHomework(int $assignmentId, int $studentId, ?string $content, ?string $fileUrl = null): Submission
    {
        $assignment = Assignment::findOne($assignmentId);
        if (!$assignment) {
            throw new NotFoundHttpException('Uy vazifasi topilmadi');
        }

        $submission = Submission::findOne([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
        ]);

        if (!$submission) {
            $submission = new Submission();
            $submission->assignment_id = $assignmentId;
            $submission->student_id = $studentId;
        }

        $submission->text_content = $content;
        $submission->file_url = $fileUrl;
        $submission->submitted_at = time();
        $submission->status = 10; // submitted

        if (!$submission->save()) {
            throw new \Exception(implode(', ', $submission->getFirstErrors()));
        }

        return $submission;
    }

    /**
     * Grade a student homework submission
     */
    public static function gradeSubmission(int $submissionId, float $score, ?string $feedback = null): Submission
    {
        $submission = Submission::findOne($submissionId);
        if (!$submission) {
            throw new NotFoundHttpException('Topshiriq topilmadi');
        }

        $submission->score = $score;
        $submission->teacher_feedback = $feedback;
        $submission->status = 20; // graded
        $submission->save(false);

        return $submission;
    }
}
