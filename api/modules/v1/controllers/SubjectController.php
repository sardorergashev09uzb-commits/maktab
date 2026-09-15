<?php
namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class SubjectController extends ActiveController
{
    public $modelClass = 'common\models\Subject';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }
}
