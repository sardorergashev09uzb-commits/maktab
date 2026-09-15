<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class CoinReward extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%coin_reward}}';
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
            [['title', 'coins_cost'], 'required'],
            [['coins_cost', 'stock_quantity', 'created_at', 'updated_at'], 'integer'],
            [['description'], 'string'],
            [['is_active'], 'boolean'],
            [['title'], 'string', 'max' => 150],
            [['image_url'], 'string', 'max' => 255],
        ];
    }

    public function getRedemptions()
    {
        return $this->hasMany(RewardRedemption::class, ['coin_reward_id' => 'id']);
    }

    public function extraFields()
    {
        return ['redemptions'];
    }
}
