<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Exam extends ActiveRecord
{
    const STATUS_DRAFT = 10;
    const STATUS_PUBLISHED = 20;
    const STATUS_ACTIVE = 30;
    const STATUS_COMPLETED = 40;

    public static function tableName()
    {
        return '{{%exam}}';
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
            [['title', 'start_time', 'end_time'], 'required'],
            [['academic_year_id', 'school_class_id', 'subject_id', 'teacher_id', 'duration_minutes', 'status', 'created_at', 'updated_at'], 'integer'],
            [['description'], 'string'],
            [['start_time', 'end_time'], 'safe'],
            [['passing_score', 'max_score'], 'number'],
            [['shuffle_questions'], 'boolean'],
            [['title'], 'string', 'max' => 255],
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
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

    public function getExamQuestions()
    {
        return $this->hasMany(ExamQuestion::class, ['exam_id' => 'id']);
    }

    public function getQuestions()
    {
        return $this->hasMany(Question::class, ['id' => 'question_id'])->viaTable('{{%exam_question}}', ['exam_id' => 'id']);
    }

    public function getExamAttempts()
    {
        return $this->hasMany(ExamAttempt::class, ['exam_id' => 'id']);
    }
}
