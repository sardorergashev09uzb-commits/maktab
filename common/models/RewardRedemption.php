<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class RewardRedemption extends ActiveRecord
{
    const STATUS_PENDING = 10;
    const STATUS_DELIVERED = 20;
    const STATUS_CANCELLED = 30;

    public static function tableName()
    {
        return '{{%reward_redemption}}';
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }

    public function rules()
    {
        return [
            [['student_id', 'coin_reward_id', 'coins_spent'], 'required'],
            [['student_id', 'coin_reward_id', 'coins_spent', 'status', 'delivered_at', 'created_at', 'updated_at'], 'integer'],
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getReward()
    {
        return $this->hasOne(CoinReward::class, ['id' => 'coin_reward_id']);
    }

    public function extraFields()
    {
        return ['student', 'reward'];
    }
}
