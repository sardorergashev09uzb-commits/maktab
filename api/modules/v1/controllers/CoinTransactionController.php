<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\CoinTransaction;
use common\services\CoinService;
use Yii;
use yii\web\BadRequestHttpException;

class CoinTransactionController extends ActiveController
{
    public $modelClass = 'common\models\CoinTransaction';

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
        $query = CoinTransaction::find()->with(['student.user', 'createdByUser']);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        $type = Yii::$app->request->get('type');
        if ($type) {
            $query->andWhere(['type' => $type]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    public function actionAward()
    {
        $req = Yii::$app->request->post();
        $studentId = $req['student_id'] ?? null;
        $amount = $req['amount'] ?? null;
        $reason = $req['reason'] ?? 'Rag\'batlantirish';
        $refType = $req['reference_type'] ?? 'manual_bonus';
        $refId = $req['reference_id'] ?? null;
        $userId = Yii::$app->user->id;

        if (!$studentId || !$amount) {
            throw new BadRequestHttpException('student_id va amount maydonlari to\'ldirilishi shart.');
        }

        $service = new CoinService();
        return $service->awardCoins($studentId, $amount, $reason, $refType, $refId, $userId);
    }

    public function actionSpend()
    {
        $req = Yii::$app->request->post();
        $studentId = $req['student_id'] ?? null;
        $amount = $req['amount'] ?? null;
        $reason = $req['reason'] ?? 'Coin sarflandi';
        $refType = $req['reference_type'] ?? 'manual_spend';
        $refId = $req['reference_id'] ?? null;
        $userId = Yii::$app->user->id;

        if (!$studentId || !$amount) {
            throw new BadRequestHttpException('student_id va amount maydonlari to\'ldirilishi shart.');
        }

        $service = new CoinService();
        return $service->spendCoins($studentId, $amount, $reason, $refType, $refId, $userId);
    }

    public function actionBalance($student_id)
    {
        $service = new CoinService();
        return [
            'student_id' => (int)$student_id,
            'balance' => $service->getBalance($student_id),
        ];
    }

    public function actionLeaderboard()
    {
        $service = new CoinService();
        $limit = (int)Yii::$app->request->get('limit', 10);
        return $service->getLeaderboard($limit);
    }
}
