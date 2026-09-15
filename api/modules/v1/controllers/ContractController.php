<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Contract;
use common\services\FinanceService;
use Yii;
use yii\web\NotFoundHttpException;

class ContractController extends ActiveController
{
    public $modelClass = 'common\models\Contract';

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
        $query = Contract::find()->with(['student.user', 'parent.user', 'academicYear', 'invoices']);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        $status = Yii::$app->request->get('status');
        if ($status !== null && $status !== '') {
            $query->andWhere(['status' => $status]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    public function actionGenerateInvoices($id)
    {
        $contract = Contract::findOne($id);
        if (!$contract) {
            throw new NotFoundHttpException('Shartnoma topilmadi.');
        }

        $service = new FinanceService();
        $invoices = $service->generateContractInvoices($contract);

        return [
            'success' => true,
            'message' => count($invoices) . ' ta invoys muvaffaqiyatli shakllantirildi.',
            'invoices' => $invoices,
        ];
    }
}
