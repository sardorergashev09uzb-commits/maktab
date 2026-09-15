<?php

namespace api\modules\v1\controllers;

use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\Notification;
use common\services\NotificationService;
use Yii;

class NotificationController extends Controller
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
        $userId = Yii::$app->user->id;
        return Notification::find()
            ->where(['user_id' => $userId])
            ->orderBy(['id' => SORT_DESC])
            ->limit(30)
            ->all();
    }

    public function actionRead($id)
    {
        $userId = Yii::$app->user->id;
        $service = new NotificationService();
        $success = $service->markAsRead($id, $userId);

        return [
            'success' => $success,
        ];
    }

    public function actionUnreadCount()
    {
        $userId = Yii::$app->user->id;
        $service = new NotificationService();
        return [
            'unread_count' => $service->getUnreadCount($userId),
        ];
    }
}
