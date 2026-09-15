<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Term extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%term}}';
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
            [['academic_year_id', 'name', 'start_date', 'end_date'], 'required'],
            [['academic_year_id', 'created_at', 'updated_at'], 'integer'],
            [['start_date', 'end_date'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['academic_year_id'], 'exist', 'skipOnError' => true, 'targetClass' => AcademicYear::class, 'targetAttribute' => ['academic_year_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'academic_year_id' => 'Academic Year ID',
            'name' => 'Name',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }
}
