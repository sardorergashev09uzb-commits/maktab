<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Lesson;
use common\services\GradingService;
use yii\web\NotFoundHttpException;

class LessonController extends ActiveController
{
    public $modelClass = 'common\models\Lesson';

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
        $query = Lesson::find()
            ->with(['schoolClass', 'subject', 'teacher.user', 'room', 'attendances', 'grades']);

        $date = \Yii::$app->request->get('date');
        if ($date) {
            $query->andWhere(['date' => $date]);
        }

        $classId = \Yii::$app->request->get('class_id');
        if ($classId) {
            $query->andWhere(['school_class_id' => $classId]);
        }

        $teacherId = \Yii::$app->request->get('teacher_id');
        if ($teacherId) {
            $query->andWhere(['teacher_id' => $teacherId]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['date' => SORT_DESC, 'start_time' => SORT_ASC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    /**
     * Get deadline and override status for a lesson
     */
    public function actionDeadline($id)
    {
        $lesson = Lesson::findOne($id);
        if (!$lesson) {
            throw new NotFoundHttpException('Dars topilmadi');
        }

        $studentId = \Yii::$app->request->get('student_id');
        return GradingService::getDeadlineStatus($lesson, $studentId ? (int)$studentId : null);
    }
}
