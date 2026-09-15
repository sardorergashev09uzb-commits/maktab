<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Invoice;
use Yii;

class InvoiceController extends ActiveController
{
    public $modelClass = 'common\models\Invoice';

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
        $query = Invoice::find()->with(['contract', 'student.user', 'items', 'payments']);

        $studentId = Yii::$app->request->get('student_id');
        if ($studentId) {
            $query->andWhere(['student_id' => $studentId]);
        }

        $contractId = Yii::$app->request->get('contract_id');
        if ($contractId) {
            $query->andWhere(['contract_id' => $contractId]);
        }

        $status = Yii::$app->request->get('status');
        if ($status !== null && $status !== '') {
            $query->andWhere(['status' => $status]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['due_date' => SORT_ASC, 'id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }
}
