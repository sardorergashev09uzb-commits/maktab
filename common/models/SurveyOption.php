<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SurveyOption extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%survey_option}}';
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
            [['survey_question_id', 'option_text'], 'required'],
            [['survey_question_id', 'dimension_id', 'order_number', 'created_at', 'updated_at'], 'integer'],
            [['weight'], 'number'],
            [['option_text'], 'string', 'max' => 500],
        ];
    }

    public function getQuestion()
    {
        return $this->hasOne(SurveyQuestion::class, ['id' => 'survey_question_id']);
    }

    public function getDimension()
    {
        return $this->hasOne(SurveyDimension::class, ['id' => 'dimension_id']);
    }

    public function extraFields()
    {
        return ['question', 'dimension'];
    }
}
