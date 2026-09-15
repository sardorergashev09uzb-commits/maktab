<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SurveyQuestion extends ActiveRecord
{
    const TYPE_SINGLE_CHOICE = 'single_choice';
    const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    const TYPE_RATING_SCALE = 'rating_scale';
    const TYPE_TEXT = 'text';

    public static function tableName()
    {
        return '{{%survey_question}}';
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
            [['survey_id', 'question_text'], 'required'],
            [['survey_id', 'order_number', 'created_at', 'updated_at'], 'integer'],
            [['question_text'], 'string'],
            [['is_required'], 'boolean'],
            [['question_type'], 'string', 'max' => 30],
        ];
    }

    public function getSurvey()
    {
        return $this->hasOne(Survey::class, ['id' => 'survey_id']);
    }

    public function getOptions()
    {
        return $this->hasMany(SurveyOption::class, ['survey_question_id' => 'id'])->orderBy(['order_number' => SORT_ASC]);
    }

    public function getAnswers()
    {
        return $this->hasMany(SurveyAnswer::class, ['survey_question_id' => 'id']);
    }

    public function extraFields()
    {
        return ['survey', 'options', 'answers'];
    }
}
