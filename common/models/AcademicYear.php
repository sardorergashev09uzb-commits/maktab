<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class AcademicYear extends ActiveRecord
{
    const STATUS_ACTIVE = 10;
    const STATUS_INACTIVE = 0;

    public static function tableName()
    {
        return '{{%academic_year}}';
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
            [['name', 'start_date', 'end_date'], 'required'],
            [['start_date', 'end_date'], 'safe'],
            [['is_current'], 'boolean'],
            [['status', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 255],
            [['status'], 'default', 'value' => self::STATUS_ACTIVE],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'is_current' => 'Is Current',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public static function findCurrent()
    {
        return static::findOne(['is_current' => true, 'status' => self::STATUS_ACTIVE]);
    }

    public function getTerms()
    {
        return $this->hasMany(Term::class, ['academic_year_id' => 'id']);
    }

    public function getSchoolClasses()
    {
        return $this->hasMany(SchoolClass::class, ['academic_year_id' => 'id']);
    }

    public function getEnrollments()
    {
        return $this->hasMany(Enrollment::class, ['academic_year_id' => 'id']);
    }

    public function getTeacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, ['academic_year_id' => 'id']);
    }
}
