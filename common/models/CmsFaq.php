<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class CmsFaq extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%cms_faq}}';
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
            [['question', 'answer'], 'required'],
            [['answer'], 'string'],
            [['is_active'], 'boolean'],
            [['order_number', 'created_at', 'updated_at'], 'integer'],
            [['question'], 'string', 'max' => 500],
            [['category'], 'string', 'max' => 50],
        ];
    }
}
