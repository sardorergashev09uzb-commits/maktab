<?php

namespace common\models;

use yii\db\ActiveRecord;

class ExamQuestion extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%exam_question}}';
    }

    public function rules()
    {
        return [
            [['exam_id', 'question_id', 'order_number'], 'integer'],
            [['points'], 'number'],
        ];
    }

    public function getExam()
    {
        return $this->hasOne(Exam::class, ['id' => 'exam_id']);
    }

    public function getQuestion()
    {
        return $this->hasOne(Question::class, ['id' => 'question_id']);
    }
}
