<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Grade;
use common\models\Lesson;
use common\services\GradingService;
use Yii;
use yii\web\ForbiddenHttpException;

class GradeController extends ActiveController
{
    public $modelClass = 'common\models\Grade';

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
        $query = Grade::find()->with(['student.user', 'teacher.user', 'gradeCategory', 'lesson']);

        $lessonId = Yii::$app->request->get('lesson_id');
        if ($lessonId) {
            $query->andWhere(['lesson_id' => $lessonId]);
        }

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 100],
        ]);
    }

    /**
     * Check deadline before creating a grade
     */
    public function checkAccess($action, $model = null, $params = [])
    {
        if (in_array($action, ['create', 'update'])) {
            $lessonId = $model ? $model->lesson_id : Yii::$app->request->post('lesson_id');
            $studentId = $model ? $model->student_id : Yii::$app->request->post('student_id');

            if ($lessonId) {
                $lesson = Lesson::findOne($lessonId);
                if ($lesson) {
                    $deadlineInfo = GradingService::getDeadlineStatus($lesson, $studentId ? (int)$studentId : null);
                    if (!$deadlineInfo['is_open']) {
                        throw new ForbiddenHttpException("Baholash muddati o'tgan ({$deadlineInfo['label']}). Zavuchdan ruxsat so'rashingiz lozim.");
                    }
                }
            }
        }
    }
}
