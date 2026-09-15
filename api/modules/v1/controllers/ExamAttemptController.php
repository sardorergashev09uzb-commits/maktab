<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\ExamAttempt;
use common\services\ExamService;
use Yii;

class ExamAttemptController extends ActiveController
{
    public $modelClass = 'common\models\ExamAttempt';

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
        $query = ExamAttempt::find()->with(['exam.subject', 'student.user', 'answers.question']);

        $examId = Yii::$app->request->get('exam_id');
        if ($examId) {
            $query->andWhere(['exam_id' => $examId]);
        }

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['started_at' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    /**
     * Submit exam attempt and calculate result
     */
    public function actionSubmit($id)
    {
        $answers = Yii::$app->request->post('answers', []);

        $attempt = ExamService::submitAttempt((int)$id, $answers);

        return [
            'success' => true,
            'message' => 'Imtihon muvaffaqiyatli topshirildi',
            'attempt' => ExamAttempt::find()
                ->where(['id' => $attempt->id])
                ->with(['exam', 'answers.question.options'])
                ->one(),
        ];
    }
}
