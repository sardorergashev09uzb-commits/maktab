<?php

namespace common\models;

use yii\db\ActiveRecord;

class CoinTransaction extends ActiveRecord
{
    const TYPE_CREDIT = 'credit';
    const TYPE_DEBIT = 'debit';

    public static function tableName()
    {
        return '{{%coin_transaction}}';
    }

    public function rules()
    {
        return [
            [['student_id', 'amount', 'type', 'reason', 'created_at'], 'required'],
            [['student_id', 'amount', 'reference_id', 'created_by', 'created_at'], 'integer'],
            [['type'], 'string', 'max' => 30],
            [['reason'], 'string', 'max' => 255],
            [['reference_type'], 'string', 'max' => 50],
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getCreatedByUser()
    {
        return $this->hasOne(User::class, ['id' => 'created_by']);
    }

    public function extraFields()
    {
        return ['student', 'createdByUser'];
    }
}
