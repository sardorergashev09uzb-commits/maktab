<?php

namespace common\services;

use Yii;
use common\models\Survey;
use common\models\SurveyDimension;
use common\models\SurveyQuestion;
use common\models\SurveyOption;
use common\models\SurveyResponse;
use common\models\SurveyAnswer;
use yii\web\NotFoundHttpException;
use yii\web\BadRequestHttpException;

class SurveyService
{
    /**
     * Submit survey answers and run Dimension Scoring Engine
     */
    public function submitSurvey($surveyId, $userId, array $answersData, $targetTeacherId = null)
    {
        $survey = Survey::findOne($surveyId);
        if (!$survey) {
            throw new NotFoundHttpException('So\'rovnoma topilmadi.');
        }

        if ($survey->status !== Survey::STATUS_PUBLISHED) {
            throw new BadRequestHttpException('Ushbu so\'rovnoma ayni vaqtda faol emas.');
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            $time = time();

            $response = new SurveyResponse();
            $response->survey_id = $survey->id;
            $response->user_id = $survey->is_anonymous ? null : $userId;
            $response->target_teacher_id = $targetTeacherId;
            $response->submitted_at = $time;
            $response->status = SurveyResponse::STATUS_COMPLETED;
            $response->save(false);

            // Scores accumulator per dimension_id
            $dimensionPoints = [];
            $dimensions = SurveyDimension::find()->where(['survey_id' => $survey->id])->indexBy('id')->all();
            foreach ($dimensions as $dimId => $dim) {
                $dimensionPoints[$dimId] = 0.0;
            }

            foreach ($answersData as $ans) {
                $qId = $ans['question_id'] ?? null;
                $optId = $ans['option_id'] ?? null;
                $rating = $ans['rating'] ?? null;
                $text = $ans['text'] ?? null;

                if (!$qId) continue;

                $answerRecord = new SurveyAnswer();
                $answerRecord->survey_response_id = $response->id;
                $answerRecord->survey_question_id = $qId;
                $answerRecord->survey_option_id = $optId;
                $answerRecord->rating_value = $rating;
                $answerRecord->text_answer = $text;
                $answerRecord->created_at = $time;
                $answerRecord->save(false);

                if ($optId) {
                    $option = SurveyOption::findOne($optId);
                    if ($option && $option->dimension_id && isset($dimensionPoints[$option->dimension_id])) {
                        $dimensionPoints[$option->dimension_id] += (float)$option->weight;
                    }
                }
            }

            // Scoring Engine
            $calculatedScores = [];
            $primaryDimensionId = null;
            $maxScore = -1.0;
            $totalPoints = array_sum($dimensionPoints);

            foreach ($dimensions as $dimId => $dim) {
                $score = $dimensionPoints[$dimId] ?? 0.0;
                $pct = $totalPoints > 0 ? round(($score / $totalPoints) * 100) : 0;

                $calculatedScores[] = [
                    'dimension_id' => $dimId,
                    'code' => $dim->code,
                    'name' => $dim->name,
                    'color_code' => $dim->color_code,
                    'score' => $score,
                    'percentage' => $pct,
                ];

                if ($score > $maxScore) {
                    $maxScore = $score;
                    $primaryDimensionId = $dimId;
                }
            }

            // Sort calculatedScores descending by score
            usort($calculatedScores, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            $recommendationText = null;
            if ($primaryDimensionId && isset($dimensions[$primaryDimensionId])) {
                $primaryDim = $dimensions[$primaryDimensionId];
                $recommendationText = $primaryDim->recommendation_text ?: "Sizning natijalaringiz bo'yicha eng kuchli yo'nalishingiz: {$primaryDim->name}.";
            }

            $response->dimension_scores = json_encode($calculatedScores);
            $response->primary_dimension_id = $primaryDimensionId;
            $response->recommendation = $recommendationText;
            $response->save(false);

            $transaction->commit();

            // Reward student with 15 coins if authenticated and career test
            if ($userId && !$survey->is_anonymous && $survey->type === Survey::TYPE_CAREER_GUIDANCE) {
                $student = \common\models\Student::findOne(['user_id' => $userId]);
                if ($student) {
                    $coinService = new CoinService();
                    $coinService->awardCoins($student->id, 15, 'Kasbga yo\'naltirish diagnostikasini topshirdi', 'survey', $survey->id);
                }

                $notifService = new NotificationService();
                $notifService->sendNotification(
                    $userId,
                    'Diagnostika natijangiz tayyor!',
                    "\"{$survey->title}\" bo'yicha tahliliy xulosangiz shakllantirildi. Natijalarni ko'rishingiz mumkin.",
                    'survey',
                    "/surveys/take?id={$survey->id}&response_id={$response->id}"
                );
            }

            return [
                'response_id' => $response->id,
                'survey_id' => $survey->id,
                'primary_dimension' => $primaryDimensionId && isset($dimensions[$primaryDimensionId]) ? [
                    'id' => $dimensions[$primaryDimensionId]->id,
                    'name' => $dimensions[$primaryDimensionId]->name,
                    'code' => $dimensions[$primaryDimensionId]->code,
                    'color_code' => $dimensions[$primaryDimensionId]->color_code,
                ] : null,
                'dimension_scores' => $calculatedScores,
                'recommendation' => $recommendationText,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }
    }

    /**
     * Aggregated analytics for a survey
     */
    public function getAnalytics($surveyId)
    {
        $survey = Survey::findOne($surveyId);
        if (!$survey) {
            throw new NotFoundHttpException('So\'rovnoma topilmadi.');
        }

        $totalResponses = (int)SurveyResponse::find()->where(['survey_id' => $survey->id])->count();

        // Dimension breakdown
        $dimensions = SurveyDimension::find()->where(['survey_id' => $survey->id])->all();
        $dimensionStats = [];
        foreach ($dimensions as $dim) {
            $count = (int)SurveyResponse::find()
                ->where(['survey_id' => $survey->id, 'primary_dimension_id' => $dim->id])
                ->count();
            $dimensionStats[] = [
                'dimension_id' => $dim->id,
                'name' => $dim->name,
                'code' => $dim->code,
                'color_code' => $dim->color_code,
                'primary_count' => $count,
                'percentage' => $totalResponses > 0 ? round(($count / $totalResponses) * 100, 1) : 0,
            ];
        }

        // Rating questions averages
        $ratingQuestions = SurveyQuestion::find()
            ->where(['survey_id' => $survey->id, 'question_type' => 'rating_scale'])
            ->all();

        $ratingStats = [];
        foreach ($ratingQuestions as $rq) {
            $avg = (float)SurveyAnswer::find()
                ->where(['survey_question_id' => $rq->id])
                ->average('rating_value');
            $ratingStats[] = [
                'question_id' => $rq->id,
                'question_text' => $rq->question_text,
                'average_rating' => round($avg, 2),
            ];
        }

        // Qualitative text feedback
        $textFeedback = SurveyAnswer::find()
            ->innerJoinWith('question')
            ->where(['survey_question.survey_id' => $survey->id, 'survey_question.question_type' => 'text'])
            ->andWhere(['not', ['survey_answer.text_answer' => null]])
            ->andWhere(['!=', 'survey_answer.text_answer', ''])
            ->orderBy(['survey_answer.id' => SORT_DESC])
            ->limit(10)
            ->select(['survey_answer.text_answer', 'survey_answer.created_at'])
            ->asArray()
            ->all();

        return [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'type' => $survey->type,
                'target_role' => $survey->target_role,
                'is_anonymous' => (bool)$survey->is_anonymous,
            ],
            'total_responses' => $totalResponses,
            'dimensions' => $dimensionStats,
            'ratings' => $ratingStats,
            'recent_feedback' => $textFeedback,
        ];
    }
}
