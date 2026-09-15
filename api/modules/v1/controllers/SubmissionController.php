<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Submission;
use common\services\LmsService;
use Yii;

class SubmissionController extends ActiveController
{
    public $modelClass = 'common\models\Submission';

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
        $query = Submission::find()->with(['student.user', 'assignment']);

        $assignmentId = Yii::$app->request->get('assignment_id');
        if ($assignmentId) {
            $query->andWhere(['assignment_id' => $assignmentId]);
        }

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['submitted_at' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    /**
     * Teacher grades a submission
     */
    public function actionGrade($id)
    {
        $score = (float) Yii::$app->request->post('score');
        $feedback = Yii::$app->request->post('teacher_feedback');

        $submission = LmsService::gradeSubmission((int)$id, $score, $feedback);

        return [
            'success' => true,
            'message' => 'Topshiriq baholandi',
            'data' => $submission,
        ];
    }
}
