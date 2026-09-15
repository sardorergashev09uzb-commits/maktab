<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Subject extends ActiveRecord
{
    const STATUS_ACTIVE = 10;
    const STATUS_INACTIVE = 0;

    public static function tableName()
    {
        return '{{%subject}}';
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
            [['status', 'created_at', 'updated_at'], 'integer'],
            [['name', 'code', 'description'], 'string', 'max' => 255],
            [['status'], 'default', 'value' => self::STATUS_ACTIVE],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'code' => 'Code',
            'description' => 'Description',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getTeacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, ['subject_id' => 'id']);
    }
}
