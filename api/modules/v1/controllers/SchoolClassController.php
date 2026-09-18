<?php
namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\SchoolClass;

class SchoolClassController extends ActiveController
{
    public $modelClass = 'common\models\SchoolClass';

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
        $query = SchoolClass::find();

        $expand = Yii::$app->request->get('expand', '');
        $expandList = array_filter(array_map('trim', explode(',', $expand)));

        $joins = [];
        if (in_array('academicYear', $expandList)) $joins[] = 'academicYear';
        if (in_array('room', $expandList)) $joins[] = 'room';
        if (in_array('classTeacher', $expandList) || in_array('classTeacher.user', $expandList)) {
            $joins[] = 'classTeacher';
            $joins[] = 'classTeacher.user';
        }

        if (!empty($joins)) {
            $query->with($joins);
        }

        $q = Yii::$app->request->get('q');
        if ($q) {
            $query->andWhere(['like', '{{%school_class}}.name', $q]);
        }

        $grade = Yii::$app->request->get('grade_level');
        if ($grade) {
            $query->andWhere(['{{%school_class}}.grade_level' => (int)$grade]);
        }

        $yearId = Yii::$app->request->get('academic_year_id');
        if ($yearId) {
            $query->andWhere(['{{%school_class}}.academic_year_id' => (int)$yearId]);
        }

        return new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => (int)Yii::$app->request->get('per-page', 100),
            ],
            'sort' => [
                'defaultOrder' => ['grade_level' => SORT_ASC, 'name' => SORT_ASC],
            ],
        ]);
    }

    /**
     * Set class teacher: POST /v1/school-class/{id}/set-teacher
     * Body: { teacher_id: 5 }
     */
    public function actionSetTeacher($id)
    {
        $model = SchoolClass::findOne($id);
        if (!$model) {
            throw new \yii\web\NotFoundHttpException('Sinf topilmadi.');
        }

        $body = Yii::$app->request->getBodyParams();
        $model->class_teacher_id = $body['teacher_id'] ?? null;

        if (!$model->save()) {
            throw new \yii\web\BadRequestHttpException(json_encode($model->errors));
        }

        return ['success' => true, 'message' => "Sinf o'qituvchisi o'zgartirildi.", 'data' => $model];
    }
}