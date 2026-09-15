<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class ParentModel extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%parent}}';
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
            [['user_id'], 'required'],
            [['user_id', 'created_at', 'updated_at'], 'integer'],
            [['occupation', 'workplace'], 'string', 'max' => 255],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'occupation' => 'Occupation',
            'workplace' => 'Workplace',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getParentStudents()
    {
        return $this->hasMany(ParentStudent::class, ['parent_id' => 'id']);
    }

    public function getStudents()
    {
        return $this->hasMany(Student::class, ['id' => 'student_id'])
            ->via('parentStudents');
    }
}
