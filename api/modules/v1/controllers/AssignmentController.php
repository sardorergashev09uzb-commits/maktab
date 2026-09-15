<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Assignment;
use Yii;

class AssignmentController extends ActiveController
{
    public $modelClass = 'common\models\Assignment';

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
        $query = Assignment::find()->with(['schoolClass', 'subject', 'teacher.user', 'submissions']);

        $classId = Yii::$app->request->get('class_id');
        if ($classId) {
            $query->andWhere(['school_class_id' => $classId]);
        }

        $subjectId = Yii::$app->request->get('subject_id');
        if ($subjectId) {
            $query->andWhere(['subject_id' => $subjectId]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['due_date' => SORT_ASC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }
}
