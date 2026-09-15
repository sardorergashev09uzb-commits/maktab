<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Room extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%room}}';
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
            [['name'], 'required'],
            [['capacity', 'created_at', 'updated_at'], 'integer'],
            [['name', 'building'], 'string', 'max' => 255],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'capacity' => 'Capacity',
            'building' => 'Building',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getSchoolClasses()
    {
        return $this->hasMany(SchoolClass::class, ['room_id' => 'id']);
    }
}
