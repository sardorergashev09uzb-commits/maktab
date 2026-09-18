<?php
namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\TeacherAssignment;

class TeacherAssignmentController extends ActiveController
{
    public $modelClass = 'common\models\TeacherAssignment';

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
        $query = TeacherAssignment::find()->with(['teacher.user', 'subject', 'schoolClass', 'academicYear']);

        $classId = Yii::$app->request->get('school_class_id');
        if ($classId) $query->andWhere(['school_class_id' => (int)$classId]);

        $teacherId = Yii::$app->request->get('teacher_id');
        if ($teacherId) $query->andWhere(['teacher_id' => (int)$teacherId]);

        $yearId = Yii::$app->request->get('academic_year_id');
        if ($yearId) $query->andWhere(['academic_year_id' => (int)$yearId]);

        return new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 100],
        ]);
    }
}