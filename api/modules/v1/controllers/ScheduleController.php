<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Schedule;

class ScheduleController extends ActiveController
{
    public $modelClass = 'common\models\Schedule';

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
        $query = Schedule::find()
            ->with(['schoolClass', 'subject', 'teacher.user', 'room', 'academicYear']);

        $classId = \Yii::$app->request->get('class_id');
        if ($classId) {
            $query->andWhere(['school_class_id' => $classId]);
        }

        $teacherId = \Yii::$app->request->get('teacher_id');
        if ($teacherId) {
            $query->andWhere(['teacher_id' => $teacherId]);
        }

        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 50],
        ]);
    }
}
