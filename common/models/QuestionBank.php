<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class QuestionBank extends ActiveRecord
{
    const STATUS_ACTIVE = 10;

    public static function tableName()
    {
        return '{{%question_bank}}';
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
            [['subject_id', 'teacher_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['description'], 'string'],
            [['title'], 'string', 'max' => 255],
        ];
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::class, ['id' => 'subject_id']);
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'teacher_id']);
    }

    public function getQuestions()
    {
        return $this->hasMany(Question::class, ['question_bank_id' => 'id']);
    }
}
