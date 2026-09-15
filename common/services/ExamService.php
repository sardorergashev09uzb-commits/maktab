<?php

namespace common\services;

use Yii;
use common\models\Exam;
use common\models\ExamAttempt;
use common\models\ExamAnswer;
use common\models\Question;
use common\models\QuestionOption;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

class ExamService
{
    /**
     * Start or resume an exam attempt for a student
     */
    public static function startAttempt(int $examId, int $studentId): ExamAttempt
    {
        $exam = Exam::findOne($examId);
        if (!$exam) {
            throw new NotFoundHttpException('Imtihon topilmadi');
        }

        // Check if there is already an active attempt
        $existing = ExamAttempt::find()
            ->where(['exam_id' => $examId, 'student_id' => $studentId, 'status' => 10])
            ->one();

        if ($existing) {
            // Check if time expired
            $elapsedSeconds = time() - $existing->started_at;
            $maxSeconds = $exam->duration_minutes * 60;
            if ($elapsedSeconds > $maxSeconds + 60) { // 1 min grace period
                $existing->status = 20; // auto-submitted
                $existing->finished_at = $existing->started_at + $maxSeconds;
                $existing->save(false);
            } else {
                return $existing;
            }
        }

        // Create new attempt
        $attempt = new ExamAttempt();
        $attempt->exam_id = $examId;
        $attempt->student_id = $studentId;
        $attempt->started_at = time();
        $attempt->status = 10; // in_progress
        $attempt->total_score = 0;
        $attempt->passed = false;

        if (!$attempt->save()) {
            throw new \Exception(implode(', ', $attempt->getFirstErrors()));
        }

        return $attempt;
    }

    /**
     * Submit an exam attempt with answers, auto-grade, and calculate results
     */
    public static function submitAttempt(int $attemptId, array $answers): ExamAttempt
    {
        $attempt = ExamAttempt::findOne($attemptId);
        if (!$attempt) {
            throw new NotFoundHttpException('Urinish topilmadi');
        }

        if ($attempt->status === 30) {
            return $attempt; // already graded
        }

        $exam = $attempt->exam;
        $totalScore = 0.0;

        $transaction = Yii::$app->db->beginTransaction();
        try {
            foreach ($answers as $ans) {
                $questionId = (int) ($ans['question_id'] ?? 0);
                $selectedOptionId = isset($ans['selected_option_id']) ? (int) $ans['selected_option_id'] : null;
                $textAnswer = $ans['text_answer'] ?? null;

                if (!$questionId) {
                    continue;
                }

                $question = Question::findOne($questionId);
                if (!$question) {
                    continue;
                }

                $isCorrect = false;
                $scoreAwarded = 0.0;

                // Auto-grading for single_choice, formula, true_false
                if ($selectedOptionId) {
                    $option = QuestionOption::findOne($selectedOptionId);
                    if ($option && $option->question_id == $questionId && $option->is_correct) {
                        $isCorrect = true;
                        $scoreAwarded = (float) $question->points;
                    }
                }

                // Save or update exam answer
                $examAnswer = ExamAnswer::findOne([
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $questionId,
                ]);

                if (!$examAnswer) {
                    $examAnswer = new ExamAnswer();
                    $examAnswer->exam_attempt_id = $attempt->id;
                    $examAnswer->question_id = $questionId;
                }

                $examAnswer->selected_option_id = $selectedOptionId;
                $examAnswer->text_answer = $textAnswer;
                $examAnswer->is_correct = $isCorrect;
                $examAnswer->score_awarded = $scoreAwarded;
                $examAnswer->save(false);

                $totalScore += $scoreAwarded;
            }

            $attempt->total_score = $totalScore;
            $attempt->passed = ($totalScore >= (float) $exam->passing_score);
            $attempt->finished_at = time();
            $attempt->status = 30; // graded
            $attempt->save(false);

            $transaction->commit();
            return $attempt;
        } catch (\Throwable $e) {
            $transaction->rollBack();
            throw $e;
        }
    }
}
