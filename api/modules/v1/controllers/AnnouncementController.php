<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Announcement;
use Yii;

class AnnouncementController extends ActiveController
{
    public $modelClass = 'common\models\Announcement';

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
        $query = Announcement::find()->with(['author']);

        $role = Yii::$app->request->get('target_role');
        if ($role) {
            $query->andWhere(['in', 'target_role', [$role, 'all']]);
        }

        $priority = Yii::$app->request->get('priority');
        if ($priority) {
            $query->andWhere(['priority' => $priority]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['published_at' => SORT_DESC, 'id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }
}
