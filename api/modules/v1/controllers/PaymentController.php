<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Payment;
use common\services\FinanceService;
use Yii;
use yii\web\BadRequestHttpException;

class PaymentController extends ActiveController
{
    public $modelClass = 'common\models\Payment';

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
        $query = Payment::find()->with(['invoice', 'student.user', 'reversedByUser']);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        $invoiceId = Yii::$app->request->get('invoice_id');
        if ($invoiceId) {
            $query->andWhere(['invoice_id' => $invoiceId]);
        }

        $method = Yii::$app->request->get('payment_method');
        if ($method) {
            $query->andWhere(['payment_method' => $method]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    public function actionPay()
    {
        $req = Yii::$app->request->post();
        $invoiceId = $req['invoice_id'] ?? null;
        $amount = $req['amount'] ?? null;
        $method = $req['payment_method'] ?? 'cash';
        $ref = $req['transaction_reference'] ?? null;
        $notes = $req['notes'] ?? null;
        $userId = Yii::$app->user->id;

        if (!$invoiceId || !$amount) {
            throw new BadRequestHttpException('invoice_id va amount maydonlari to\'ldirilishi shart.');
        }

        $service = new FinanceService();
        return $service->recordPayment($invoiceId, $amount, $method, $ref, $notes, $userId);
    }

    public function actionReverse($id)
    {
        $reason = Yii::$app->request->post('reason', 'Xatolik tufayli bekor qilindi');
        $userId = Yii::$app->user->id;

        $service = new FinanceService();
        return $service->reversePayment($id, $reason, $userId);
    }
}
