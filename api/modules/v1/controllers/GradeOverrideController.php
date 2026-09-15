<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\GradeOverride;
use common\services\GradingService;
use Yii;
use yii\web\NotFoundHttpException;

class GradeOverrideController extends ActiveController
{
    public $modelClass = 'common\models\GradeOverride';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $query = GradeOverride::find()->with(['student.user', 'teacher.user', 'gradeCategory', 'lesson', 'zavuch']);

        $status = Yii::$app->request->get('status');
        if ($status !== null && $status !== '') {
            $query->andWhere(['status' => (int)$status]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    /**
     * Zavuch approves an override request
     */
    public function actionApprove($id)
    {
        $user = Yii::$app->user->identity;
        $notes = Yii::$app->request->post('decision_notes');

        $grade = GradingService::approveOverride((int)$id, (int)$user->id, $notes);

        return [
            'success' => true,
            'message' => 'So\'rov tasdiqlandi va baho qo\'yildi',
            'grade' => $grade,
        ];
    }

    /**
     * Zavuch rejects an override request
     */
    public function actionReject($id)
    {
        $user = Yii::$app->user->identity;
        $notes = Yii::$app->request->post('decision_notes');

        $override = GradingService::rejectOverride((int)$id, (int)$user->id, $notes);

        return [
            'success' => true,
            'message' => 'So\'rov rad etildi',
            'override' => $override,
        ];
    }
}
