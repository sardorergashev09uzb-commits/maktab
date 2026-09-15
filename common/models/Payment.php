<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Payment extends ActiveRecord
{
    const STATUS_CONFIRMED = 10;
    const STATUS_REVERSED = 20;

    public static function tableName()
    {
        return '{{%payment}}';
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
            [['payment_number', 'invoice_id', 'student_id', 'amount', 'payment_date'], 'required'],
            [['invoice_id', 'student_id', 'status', 'reversed_at', 'reversed_by', 'created_at', 'updated_at'], 'integer'],
            [['amount'], 'number'],
            [['payment_date'], 'safe'],
            [['notes', 'reversal_reason'], 'string'],
            [['payment_number'], 'string', 'max' => 50],
            [['payment_method'], 'string', 'max' => 30],
            [['transaction_reference'], 'string', 'max' => 100],
            [['payment_number'], 'unique'],
        ];
    }

    public function getInvoice()
    {
        return $this->hasOne(Invoice::class, ['id' => 'invoice_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getReversedByUser()
    {
        return $this->hasOne(User::class, ['id' => 'reversed_by']);
    }

    public function extraFields()
    {
        return ['invoice', 'student', 'reversedByUser'];
    }
}
