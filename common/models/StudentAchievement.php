<?php

namespace common\models;

use yii\db\ActiveRecord;

class StudentAchievement extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%student_achievement}}';
    }

    public function rules()
    {
        return [
            [['student_id', 'achievement_id', 'awarded_date', 'created_at'], 'required'],
            [['student_id', 'achievement_id', 'awarded_by', 'created_at'], 'integer'],
            [['awarded_date'], 'safe'],
            [['notes'], 'string'],
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getAchievement()
    {
        return $this->hasOne(Achievement::class, ['id' => 'achievement_id']);
    }

    public function getAwardedByUser()
    {
        return $this->hasOne(User::class, ['id' => 'awarded_by']);
    }

    public function extraFields()
    {
        return ['student', 'achievement', 'awardedByUser'];
    }
}
