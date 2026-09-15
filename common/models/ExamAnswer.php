<?php

namespace common\models;

use yii\db\ActiveRecord;

class ExamAnswer extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%exam_answer}}';
    }

    public function rules()
    {
        return [
            [['exam_attempt_id', 'question_id', 'selected_option_id'], 'integer'],
            [['text_answer'], 'string'],
            [['score_awarded'], 'number'],
            [['is_correct'], 'boolean'],
        ];
    }

    public function getExamAttempt()
    {
        return $this->hasOne(ExamAttempt::class, ['id' => 'exam_attempt_id']);
    }

    public function getQuestion()
    {
        return $this->hasOne(Question::class, ['id' => 'question_id']);
    }

    public function getSelectedOption()
    {
        return $this->hasOne(QuestionOption::class, ['id' => 'selected_option_id']);
    }
}
