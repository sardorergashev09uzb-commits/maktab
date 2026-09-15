<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Submission extends ActiveRecord
{
    const STATUS_SUBMITTED = 10;
    const STATUS_GRADED = 20;
    const STATUS_RETURNED = 30;

    public static function tableName()
    {
        return '{{%submission}}';
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
            [['submitted_at'], 'required'],
            [['assignment_id', 'student_id', 'submitted_at', 'status', 'created_at', 'updated_at'], 'integer'],
            [['text_content', 'teacher_feedback'], 'string'],
            [['score'], 'number'],
            [['file_url'], 'string', 'max' => 255],
        ];
    }

    public function getAssignment()
    {
        return $this->hasOne(Assignment::class, ['id' => 'assignment_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }
}
