<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SurveyDimension extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%survey_dimension}}';
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
            [['survey_id', 'name', 'code'], 'required'],
            [['survey_id', 'order_number', 'created_at', 'updated_at'], 'integer'],
            [['description', 'recommendation_text'], 'string'],
            [['name'], 'string', 'max' => 150],
            [['code'], 'string', 'max' => 50],
            [['color_code'], 'string', 'max' => 30],
        ];
    }

    public function getSurvey()
    {
        return $this->hasOne(Survey::class, ['id' => 'survey_id']);
    }

    public function getOptions()
    {
        return $this->hasMany(SurveyOption::class, ['dimension_id' => 'id']);
    }

    public function getResponses()
    {
        return $this->hasMany(SurveyResponse::class, ['primary_dimension_id' => 'id']);
    }

    public function extraFields()
    {
        return ['survey', 'options', 'responses'];
    }
}
