<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Certificate;
use common\services\AchievementService;
use Yii;
use yii\web\BadRequestHttpException;

class CertificateController extends ActiveController
{
    public $modelClass = 'common\models\Certificate';

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
        $query = Certificate::find()->with(['student.user', 'reviewedByUser']);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        $status = Yii::$app->request->get('status');
        if ($status !== null && $status !== '') {
            $query->andWhere(['status' => $status]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    public function actionVerify($id)
    {
        $status = Yii::$app->request->post('status', Certificate::STATUS_VERIFIED);
        $reviewNotes = Yii::$app->request->post('review_notes');
        $userId = Yii::$app->user->id;

        $service = new AchievementService();
        return $service->verifyCertificate($id, $status, $reviewNotes, $userId);
    }
}
