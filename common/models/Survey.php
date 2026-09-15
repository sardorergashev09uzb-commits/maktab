<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Survey extends ActiveRecord
{
    const TYPE_CAREER_GUIDANCE = 'career_guidance';
    const TYPE_INTEREST_DIAGNOSTIC = 'interest_diagnostic';
    const TYPE_TEACHER_EVAL = 'teacher_eval';
    const TYPE_SCHOOL_EVAL = 'school_eval';
    const TYPE_CUSTOM = 'custom';

    const STATUS_DRAFT = 10;
    const STATUS_PUBLISHED = 20;
    const STATUS_CLOSED = 30;

    public static function tableName()
    {
        return '{{%survey}}';
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
            [['description'], 'string'],
            [['academic_year_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['is_anonymous'], 'boolean'],
            [['start_date', 'end_date'], 'safe'],
            [['title'], 'string', 'max' => 255],
            [['type'], 'string', 'max' => 50],
            [['target_role'], 'string', 'max' => 30],
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }

    public function getDimensions()
    {
        return $this->hasMany(SurveyDimension::class, ['survey_id' => 'id'])->orderBy(['order_number' => SORT_ASC]);
    }

    public function getQuestions()
    {
        return $this->hasMany(SurveyQuestion::class, ['survey_id' => 'id'])->orderBy(['order_number' => SORT_ASC]);
    }

    public function getResponses()
    {
        return $this->hasMany(SurveyResponse::class, ['survey_id' => 'id']);
    }

    public function extraFields()
    {
        return ['academicYear', 'dimensions', 'questions', 'responses'];
    }
}
