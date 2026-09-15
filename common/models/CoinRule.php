<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class CoinRule extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%coin_rule}}';
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
            [['title', 'code', 'coins_amount'], 'required'],
            [['coins_amount', 'created_at', 'updated_at'], 'integer'],
            [['is_active'], 'boolean'],
            [['description'], 'string'],
            [['title'], 'string', 'max' => 100],
            [['code'], 'string', 'max' => 50],
            [['code'], 'unique'],
        ];
    }
}
