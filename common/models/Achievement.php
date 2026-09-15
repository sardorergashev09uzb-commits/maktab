<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Achievement extends ActiveRecord
{
    const CATEGORY_ACADEMIC = 'academic';
    const CATEGORY_SPORT = 'sport';
    const CATEGORY_CREATIVE = 'creative';
    const CATEGORY_DISCIPLINE = 'discipline';

    public static function tableName()
    {
        return '{{%achievement}}';
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
            [['title'], 'required'],
            [['description'], 'string'],
            [['coin_reward', 'created_at', 'updated_at'], 'integer'],
            [['is_active'], 'boolean'],
            [['title'], 'string', 'max' => 150],
            [['category', 'icon'], 'string', 'max' => 50],
            [['badge_color'], 'string', 'max' => 30],
        ];
    }

    public function getStudentAchievements()
    {
        return $this->hasMany(StudentAchievement::class, ['achievement_id' => 'id']);
    }

    public function getStudents()
    {
        return $this->hasMany(Student::class, ['id' => 'student_id'])
            ->via('studentAchievements');
    }

    public function extraFields()
    {
        return ['studentAchievements', 'students'];
    }
}
