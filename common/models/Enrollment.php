<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Enrollment extends ActiveRecord
{
    const STATUS_ACTIVE = 10;
    const STATUS_TRANSFERRED = 20;
    const STATUS_GRADUATED = 30;
    const STATUS_EXPELLED = 40;

    public static function tableName()
    {
        return '{{%enrollment}}';
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
            [['student_id', 'school_class_id', 'academic_year_id'], 'required'],
            [['student_id', 'school_class_id', 'academic_year_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['enrollment_date'], 'safe'],
            [['status'], 'default', 'value' => self::STATUS_ACTIVE],
            [['student_id'], 'exist', 'skipOnError' => true, 'targetClass' => Student::class, 'targetAttribute' => ['student_id' => 'id']],
            [['school_class_id'], 'exist', 'skipOnError' => true, 'targetClass' => SchoolClass::class, 'targetAttribute' => ['school_class_id' => 'id']],
            [['academic_year_id'], 'exist', 'skipOnError' => true, 'targetClass' => AcademicYear::class, 'targetAttribute' => ['academic_year_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'student_id' => 'Student ID',
            'school_class_id' => 'School Class ID',
            'academic_year_id' => 'Academic Year ID',
            'enrollment_date' => 'Enrollment Date',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getSchoolClass()
    {
        return $this->hasOne(SchoolClass::class, ['id' => 'school_class_id']);
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }
}
