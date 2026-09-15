<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class CmsSection extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%cms_section}}';
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
            [['key', 'title'], 'required'],
            [['content'], 'string'],
            [['is_active'], 'boolean'],
            [['order_number', 'created_at', 'updated_at'], 'integer'],
            [['key'], 'string', 'max' => 50],
            [['title', 'subtitle', 'image_url'], 'string', 'max' => 255],
            [['key'], 'unique'],
        ];
    }
}
