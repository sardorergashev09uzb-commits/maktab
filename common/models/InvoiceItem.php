<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class InvoiceItem extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%invoice_item}}';
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
            [['invoice_id', 'description', 'amount'], 'required'],
            [['invoice_id', 'quantity', 'created_at', 'updated_at'], 'integer'],
            [['amount'], 'number'],
            [['description'], 'string', 'max' => 255],
        ];
    }

    public function getInvoice()
    {
        return $this->hasOne(Invoice::class, ['id' => 'invoice_id']);
    }
}
