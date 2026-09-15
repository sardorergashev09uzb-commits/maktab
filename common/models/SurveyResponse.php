<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SurveyResponse extends ActiveRecord
{
    const STATUS_COMPLETED = 10;

    public static function tableName()
    {
        return '{{%survey_response}}';
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
            [['survey_id', 'submitted_at'], 'required'],
            [['survey_id', 'user_id', 'target_teacher_id', 'primary_dimension_id', 'submitted_at', 'status', 'created_at', 'updated_at'], 'integer'],
            [['dimension_scores'], 'safe'],
            [['recommendation'], 'string'],
        ];
    }

    public function getSurvey()
    {
        return $this->hasOne(Survey::class, ['id' => 'survey_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getTargetTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'target_teacher_id']);
    }

    public function getPrimaryDimension()
    {
        return $this->hasOne(SurveyDimension::class, ['id' => 'primary_dimension_id']);
    }

    public function getAnswers()
    {
        return $this->hasMany(SurveyAnswer::class, ['survey_response_id' => 'id']);
    }

    public function extraFields()
    {
        return ['survey', 'user', 'targetTeacher', 'primaryDimension', 'answers'];
    }
}
