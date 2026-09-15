<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class ExamAttempt extends ActiveRecord
{
    const STATUS_IN_PROGRESS = 10;
    const STATUS_SUBMITTED = 20;
    const STATUS_GRADED = 30;

    public static function tableName()
    {
        return '{{%exam_attempt}}';
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
            [['started_at'], 'required'],
            [['exam_id', 'student_id', 'started_at', 'finished_at', 'status', 'created_at', 'updated_at'], 'integer'],
            [['total_score'], 'number'],
            [['passed'], 'boolean'],
        ];
    }

    public function getExam()
    {
        return $this->hasOne(Exam::class, ['id' => 'exam_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getAnswers()
    {
        return $this->hasMany(ExamAnswer::class, ['exam_attempt_id' => 'id']);
    }
}
