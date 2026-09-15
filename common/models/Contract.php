<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Contract extends ActiveRecord
{
    const STATUS_ACTIVE = 10;
    const STATUS_COMPLETED = 20;
    const STATUS_TERMINATED = 30;

    public static function tableName()
    {
        return '{{%contract}}';
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
            [['contract_number', 'student_id', 'academic_year_id', 'total_amount', 'start_date', 'end_date'], 'required'],
            [['student_id', 'parent_id', 'academic_year_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['total_amount', 'discount_amount', 'paid_amount'], 'number'],
            [['start_date', 'end_date'], 'safe'],
            [['notes'], 'string'],
            [['contract_number'], 'string', 'max' => 50],
            [['payment_plan'], 'string', 'max' => 20],
            [['contract_number'], 'unique'],
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getParent()
    {
        return $this->hasOne(ParentModel::class, ['id' => 'parent_id']);
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }

    public function getInvoices()
    {
        return $this->hasMany(Invoice::class, ['contract_id' => 'id']);
    }

    public function extraFields()
    {
        return ['student', 'parent', 'academicYear', 'invoices'];
    }
}
