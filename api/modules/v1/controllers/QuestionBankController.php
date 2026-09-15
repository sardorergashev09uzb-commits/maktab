<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\QuestionBank;
use Yii;

class QuestionBankController extends ActiveController
{
    public $modelClass = 'common\models\QuestionBank';

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
        $query = QuestionBank::find()->with(['subject', 'teacher.user', 'questions']);

        $subjectId = Yii::$app->request->get('subject_id');
        if ($subjectId) {
            $query->andWhere(['subject_id' => $subjectId]);
        }

        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 50],
        ]);
    }
}
