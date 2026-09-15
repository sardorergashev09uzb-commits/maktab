<?php

namespace common\models;

use yii\db\ActiveRecord;

class QuestionOption extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%question_option}}';
    }

    public function rules()
    {
        return [
            [['option_text'], 'required'],
            [['question_id', 'order_number'], 'integer'],
            [['option_text'], 'string'],
            [['is_correct'], 'boolean'],
        ];
    }

    public function getQuestion()
    {
        return $this->hasOne(Question::class, ['id' => 'question_id']);
    }
}
