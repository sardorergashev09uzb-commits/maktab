<?php
namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

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
        $modelClass = $this->modelClass;
        $query = $modelClass::find()->joinWith(['academicYear', 'room', 'classTeacher.user']);
        
        $q = \Yii::$app->request->get('q');
        if ($q) {
            $query->andWhere([
                'or',
                ['like', '{{%school_class}}.name', $q],
                ['like', '{{%room}}.name', $q],
            ]);
        }

        return new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => (int)\Yii::$app->request->get('per-page', 50),
            ],
            'sort' => [
                'defaultOrder' => ['grade_level' => SORT_ASC, 'name' => SORT_ASC],
            ],
        ]);
    }
}
