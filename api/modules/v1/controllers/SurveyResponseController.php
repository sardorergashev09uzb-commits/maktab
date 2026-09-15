<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\SurveyResponse;

class SurveyResponseController extends ActiveController
{
    public $modelClass = SurveyResponse::class;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'optional' => ['index', 'view'],
        ];
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
        $query = SurveyResponse::find()->with(['survey', 'primaryDimension']);

        $surveyId = Yii::$app->request->get('survey_id');
        if ($surveyId) {
            $query->andWhere(['survey_id' => $surveyId]);
        }

        $userId = Yii::$app->request->get('user_id');
        if ($userId) {
            $query->andWhere(['user_id' => $userId]);
        } elseif (!Yii::$app->user->isGuest) {
            $query->andWhere(['user_id' => Yii::$app->user->id]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 20],
        ]);
    }
}
