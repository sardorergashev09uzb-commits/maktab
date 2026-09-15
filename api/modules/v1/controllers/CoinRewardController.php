<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\CoinReward;
use common\services\CoinService;
use Yii;
use yii\web\BadRequestHttpException;

class CoinRewardController extends ActiveController
{
    public $modelClass = 'common\models\CoinReward';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actionRedeem($id)
    {
        $studentId = Yii::$app->request->post('student_id');
        if (!$studentId) {
            throw new BadRequestHttpException('student_id maydoni to\'ldirilishi shart.');
        }

        $userId = Yii::$app->user->id;
        $service = new CoinService();
        return $service->redeemReward($studentId, $id, $userId);
    }
}
