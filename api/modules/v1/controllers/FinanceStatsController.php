<?php

namespace api\modules\v1\controllers;

use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\services\FinanceService;

class FinanceStatsController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actionIndex()
    {
        $service = new FinanceService();
        return $service->getFinancialStats();
    }
}
