<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Exam;
use common\services\ExamService;
use Yii;

class ExamController extends ActiveController
{
    public $modelClass = 'common\models\Exam';

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
        $query = Exam::find()->with(['schoolClass', 'subject', 'teacher.user', 'questions.options']);

        $classId = Yii::$app->request->get('class_id');
        if ($classId) {
            $query->andWhere(['school_class_id' => $classId]);
        }

        $subjectId = Yii::$app->request->get('subject_id');
        if ($subjectId) {
            $query->andWhere(['subject_id' => $subjectId]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['start_time' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    /**
     * Student starts an exam attempt
     */
    public function actionStart($id)
    {
        $user = Yii::$app->user->identity;
        $student = $user->student;
        $studentId = $student ? $student->id : (int) Yii::$app->request->post('student_id', 1);

        $attempt = ExamService::startAttempt((int)$id, $studentId);

        // Load exam with questions and options (without exposing is_correct in live attempt)
        $exam = Exam::find()
            ->where(['id' => $id])
            ->with(['questions.options', 'subject', 'schoolClass'])
            ->one();

        return [
            'success' => true,
            'attempt' => $attempt,
            'exam' => $exam,
        ];
    }
}
