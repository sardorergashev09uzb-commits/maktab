<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Certificate extends ActiveRecord
{
    const STATUS_PENDING = 10;
    const STATUS_VERIFIED = 20;
    const STATUS_REJECTED = 30;

    public static function tableName()
    {
        return '{{%certificate}}';
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
            [['student_id', 'title', 'issuer', 'issue_date'], 'required'],
            [['student_id', 'status', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at'], 'integer'],
            [['issue_date'], 'safe'],
            [['review_notes'], 'string'],
            [['title'], 'string', 'max' => 200],
            [['issuer'], 'string', 'max' => 150],
            [['file_url'], 'string', 'max' => 255],
            [['verification_code'], 'string', 'max' => 100],
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getReviewedByUser()
    {
        return $this->hasOne(User::class, ['id' => 'reviewed_by']);
    }

    public function extraFields()
    {
        return ['student', 'reviewedByUser'];
    }
}
