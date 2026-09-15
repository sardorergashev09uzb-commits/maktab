<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\SystemSetting;
use common\models\AuditLog;

class SettingController extends Controller
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
            throw new \yii\web\ForbiddenHttpException('Tizim sozlamalari faqat administratorlar uchun ruxsat etilgan');
        }

        return true;
    }

    /**
     * Get all settings grouped
     */
    public function actionIndex()
    {
        return SystemSetting::getAllGrouped();
    }

    /**
     * Update settings (array of key => value)
     */
    public function actionUpdate()
    {
        $params = Yii::$app->request->getBodyParams();
        $updatedKeys = [];

        foreach ($params as $key => $value) {
            $setting = SystemSetting::findOne(['key' => $key]);
            if ($setting) {
                if (is_array($value) || is_object($value)) {
                    $setting->value = json_encode($value, JSON_UNESCAPED_UNICODE);
                } else {
                    $setting->value = (string)$value;
                }
                if ($setting->save()) {
                    $updatedKeys[] = $key;
                }
            }
        }

        AuditLog::log('update_settings', 'SystemSetting', null, [
            'updated_keys' => $updatedKeys
        ]);

        return [
            'success' => true,
            'updated_count' => count($updatedKeys),
            'updated_keys' => $updatedKeys,
        ];
    }
}
