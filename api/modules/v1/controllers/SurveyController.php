<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Survey;
use common\services\SurveyService;
use yii\web\NotFoundHttpException;
use yii\web\BadRequestHttpException;

class SurveyController extends ActiveController
{
    public $modelClass = Survey::class;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'optional' => ['index', 'view', 'detail', 'analytics', 'submit'],
        ];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['view']);
        return $actions;
    }

    public function actionDetail($id)
    {
        $survey = Survey::find()
            ->with(['dimensions', 'questions.options'])
            ->where(['id' => $id])
            ->asArray()
            ->one();

        if (!$survey) {
            throw new NotFoundHttpException('So\'rovnoma topilmadi.');
        }

        return $survey;
    }

    public function actionSubmit($id)
    {
        $request = Yii::$app->request;
        $body = $request->getBodyParams();
        $answers = $body['answers'] ?? [];
        $targetTeacherId = $body['target_teacher_id'] ?? null;

        if (empty($answers)) {
            throw new BadRequestHttpException('Javoblar ro\'yxati bo\'sh bo\'lishi mumkin emas.');
        }

        $userId = Yii::$app->user->isGuest ? null : Yii::$app->user->id;

        $service = new SurveyService();
        return $service->submitSurvey($id, $userId, $answers, $targetTeacherId);
    }

    public function actionAnalytics($id)
    {
        $service = new SurveyService();
        return $service->getAnalytics($id);
    }
}
