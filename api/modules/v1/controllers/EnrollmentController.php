<?php
namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\Enrollment;

class EnrollmentController extends ActiveController
{
    public $modelClass = 'common\models\Enrollment';

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
        $query = Enrollment::find()->with(['student.user', 'schoolClass', 'academicYear']);

        $classId = Yii::$app->request->get('school_class_id');
        if ($classId) $query->andWhere(['school_class_id' => (int)$classId]);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) $query->andWhere(['student_id' => (int)$studentId]);

        $yearId = Yii::$app->request->get('academic_year_id');
        if ($yearId) $query->andWhere(['academic_year_id' => (int)$yearId]);

        $status = Yii::$app->request->get('status');
        if ($status !== null) $query->andWhere(['status' => (int)$status]);

        return new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 200],
            'sort' => ['defaultOrder' => ['created_at' => SORT_DESC]],
        ]);
    }
}