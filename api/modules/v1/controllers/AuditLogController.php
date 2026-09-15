<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\AuditLog;

class AuditLogController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
        ];
        return $behaviors;
    }

    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        $user = Yii::$app->user->identity;
        if (!$user || !$user->isAdmin()) {
            throw new \yii\web\ForbiddenHttpException('Audit jurnali faqat administratorlar uchun ruxsat etilgan');
        }

        return true;
    }

    /**
     * Paginated audit log list
     */
    public function actionIndex()
    {
        $query = AuditLog::find()->with('user')->orderBy(['created_at' => SORT_DESC]);

        $action = Yii::$app->request->get('action');
        if ($action) {
            $query->andWhere(['action' => $action]);
        }

        $model = Yii::$app->request->get('model');
        if ($model) {
            $query->andWhere(['model' => $model]);
        }

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => 50,
            ],
        ]);

        return [
            'items' => $dataProvider->getModels(),
            '_meta' => [
                'totalCount' => $dataProvider->getTotalCount(),
                'pageCount' => $dataProvider->getPagination()->getPageCount(),
                'currentPage' => $dataProvider->getPagination()->getPage() + 1,
                'perPage' => $dataProvider->getPagination()->getPageSize(),
            ],
        ];
    }
}
