<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Question extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%question}}';
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
            [['question_text'], 'required'],
            [['question_bank_id', 'subject_id', 'difficulty', 'status', 'created_at', 'updated_at'], 'integer'],
            [['question_text', 'formula', 'explanation'], 'string'],
            [['points'], 'number'],
            [['type'], 'string', 'max' => 30],
            [['image_url'], 'string', 'max' => 255],
        ];
    }

    public function getQuestionBank()
    {
        return $this->hasOne(QuestionBank::class, ['id' => 'question_bank_id']);
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::class, ['id' => 'subject_id']);
    }

    public function getOptions()
    {
        return $this->hasMany(QuestionOption::class, ['question_id' => 'id']);
    }
}
