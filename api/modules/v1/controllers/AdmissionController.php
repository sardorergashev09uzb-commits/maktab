<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\AdmissionApplication;
use common\services\AdmissionService;
use yii\web\NotFoundHttpException;
use yii\web\BadRequestHttpException;

class AdmissionController extends ActiveController
{
    public $modelClass = AdmissionApplication::class;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'optional' => ['apply', 'stats'],
        ];
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
        $query = AdmissionApplication::find()->with(['academicYear', 'enrolledStudent']);

        $status = Yii::$app->request->get('status');
        if ($status && $status !== 'all') {
            $query->andWhere(['status' => $status]);
        }

        $grade = Yii::$app->request->get('grade');
        if ($grade) {
            $query->andWhere(['applying_grade' => $grade]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 20],
        ]);
    }

    /**
     * Public online application endpoint
     */
    public function actionApply()
    {
        $body = Yii::$app->request->getBodyParams();
        $service = new AdmissionService();
        return $service->createApplication($body);
    }

    /**
     * Update application status
     */
    public function actionUpdateStatus($id)
    {
        $body = Yii::$app->request->getBodyParams();
        $status = $body['status'] ?? null;
        if (!$status) {
            throw new BadRequestHttpException('Status ko\'rsatilmadi.');
        }

        $notes = $body['notes'] ?? null;
        $interviewDate = $body['interview_date'] ?? null;
        $examScore = $body['exam_score'] ?? null;

        $service = new AdmissionService();
        return $service->updateStatus($id, $status, $notes, $interviewDate, $examScore);
    }

    /**
     * Auto-enroll accepted application into school class
     */
    public function actionEnroll($id)
    {
        $body = Yii::$app->request->getBodyParams();
        $schoolClassId = $body['school_class_id'] ?? null;
        $annualTuitionFee = $body['annual_tuition_fee'] ?? 25000000;

        if (!$schoolClassId) {
            throw new BadRequestHttpException('Sinf tanlanishi shart.');
        }

        $service = new AdmissionService();
        return $service->enrollStudent($id, $schoolClassId, $annualTuitionFee);
    }

    /**
     * Funnel statistics
     */
    public function actionStats()
    {
        $service = new AdmissionService();
        return $service->getFunnelStats();
    }
}
