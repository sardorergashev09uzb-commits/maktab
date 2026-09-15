<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Attendance;
use common\services\AttendanceService;
use Yii;

class AttendanceController extends ActiveController
{
    public $modelClass = 'common\models\Attendance';

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
        $query = Attendance::find()->with(['student.user', 'lesson']);

        $lessonId = Yii::$app->request->get('lesson_id');
        if ($lessonId) {
            $query->andWhere(['lesson_id' => $lessonId]);
        }

        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 100],
        ]);
    }

    /**
     * Batch save attendance for a lesson
     */
    public function actionBatch()
    {
        $request = Yii::$app->request;
        $lessonId = (int) $request->post('lesson_id');
        $records = $request->post('records', []);

        if (!$lessonId || empty($records)) {
            Yii::$app->response->statusCode = 422;
            return ['message' => 'lesson_id va records kiritilishi shart'];
        }

        AttendanceService::saveAttendance($lessonId, $records);

        return [
            'success' => true,
            'message' => 'Davomat muvaffaqiyatli saqlandi',
            'data' => Attendance::find()->where(['lesson_id' => $lessonId])->with(['student.user'])->all(),
        ];
    }
}
