<?php

namespace common\models;

use yii\db\ActiveRecord;

class Notification extends ActiveRecord
{
    const TYPE_GRADE = 'grade';
    const TYPE_ATTENDANCE = 'attendance';
    const TYPE_PAYMENT = 'payment';
    const TYPE_ACHIEVEMENT = 'achievement';
    const TYPE_ANNOUNCEMENT = 'announcement';
    const TYPE_GENERAL = 'general';

    public static function tableName()
    {
        return '{{%notification}}';
    }

    public function rules()
    {
        return [
            [['user_id', 'title', 'message', 'created_at'], 'required'],
            [['message'], 'string'],
            [['user_id', 'read_at', 'created_at'], 'integer'],
            [['is_read'], 'boolean'],
            [['title', 'link_url'], 'string', 'max' => 255],
            [['type'], 'string', 'max' => 30],
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
}
