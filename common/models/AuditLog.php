<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

class AuditLog extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%audit_log}}';
    }

    public function rules()
    {
        return [
            [['action', 'created_at'], 'required'],
            [['user_id', 'model_id', 'created_at'], 'integer'],
            [['details'], 'string'],
            [['action'], 'string', 'max' => 50],
            [['model'], 'string', 'max' => 100],
            [['ip_address'], 'string', 'max' => 45],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function extraFields()
    {
        return ['user'];
    }

    /**
     * Record an audit log entry
     */
    public static function log($action, $model = null, $modelId = null, $details = null)
    {
        $log = new static();
        $log->action = $action;
        $log->model = $model;
        $log->model_id = $modelId;
        $log->details = is_array($details) ? json_encode($details, JSON_UNESCAPED_UNICODE) : $details;
        $log->user_id = Yii::$app->has('user') && !Yii::$app->user->isGuest ? Yii::$app->user->id : null;
        $log->ip_address = (Yii::$app->has('request') && Yii::$app->request instanceof \yii\web\Request)
            ? Yii::$app->request->getUserIP()
            : '127.0.0.1';
        $log->created_at = time();
        return $log->save(false);
    }
}
