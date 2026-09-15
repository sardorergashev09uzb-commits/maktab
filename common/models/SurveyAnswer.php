<?php

namespace common\models;

use yii\db\ActiveRecord;

class SurveyAnswer extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%survey_answer}}';
    }

    public function rules()
    {
        return [
            [['survey_response_id', 'survey_question_id', 'created_at'], 'required'],
            [['survey_response_id', 'survey_question_id', 'survey_option_id', 'rating_value', 'created_at'], 'integer'],
            [['text_answer'], 'string'],
        ];
    }

    public function getResponse()
    {
        return $this->hasOne(SurveyResponse::class, ['id' => 'survey_response_id']);
    }

    public function getQuestion()
    {
        return $this->hasOne(SurveyQuestion::class, ['id' => 'survey_question_id']);
    }

    public function getOption()
    {
        return $this->hasOne(SurveyOption::class, ['id' => 'survey_option_id']);
    }

    public function extraFields()
    {
        return ['response', 'question', 'option'];
    }
}
