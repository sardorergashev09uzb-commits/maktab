<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Invoice extends ActiveRecord
{
    const STATUS_PENDING = 10;
    const STATUS_PARTIALLY_PAID = 20;
    const STATUS_PAID = 30;
    const STATUS_OVERDUE = 40;
    const STATUS_CANCELLED = 50;

    public static function tableName()
    {
        return '{{%invoice}}';
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
            [['invoice_number', 'student_id', 'title', 'amount', 'due_date'], 'required'],
            [['contract_id', 'student_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['amount', 'paid_amount'], 'number'],
            [['due_date'], 'safe'],
            [['notes'], 'string'],
            [['invoice_number'], 'string', 'max' => 50],
            [['title'], 'string', 'max' => 255],
            [['invoice_number'], 'unique'],
        ];
    }

    public function getContract()
    {
        return $this->hasOne(Contract::class, ['id' => 'contract_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getItems()
    {
        return $this->hasMany(InvoiceItem::class, ['invoice_id' => 'id']);
    }

    public function getPayments()
    {
        return $this->hasMany(Payment::class, ['invoice_id' => 'id']);
    }

    public function extraFields()
    {
        return ['contract', 'student', 'items', 'payments'];
    }
}
