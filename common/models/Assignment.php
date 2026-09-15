<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Assignment extends ActiveRecord
{
    const STATUS_ACTIVE = 10;
    const STATUS_INACTIVE = 0;

    public static function tableName()
    {
        return '{{%assignment}}';
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
            [['title', 'description', 'due_date'], 'required'],
            [['lesson_id', 'school_class_id', 'subject_id', 'teacher_id', 'max_score', 'status', 'created_at', 'updated_at'], 'integer'],
            [['description'], 'string'],
            [['due_date'], 'safe'],
            [['title', 'attachment_url'], 'string', 'max' => 255],
        ];
    }

    public function getLesson()
    {
        return $this->hasOne(Lesson::class, ['id' => 'lesson_id']);
    }

    public function getSchoolClass()
    {
        return $this->hasOne(SchoolClass::class, ['id' => 'school_class_id']);
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::class, ['id' => 'subject_id']);
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'teacher_id']);
    }

    public function getSubmissions()
    {
        return $this->hasMany(Submission::class, ['assignment_id' => 'id']);
    }
}
