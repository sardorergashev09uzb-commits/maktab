<?php

namespace common\models;

use yii\db\ActiveRecord;

class ParentStudent extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%parent_student}}';
    }

    public function rules()
    {
        return [
            [['parent_id', 'student_id'], 'required'],
            [['parent_id', 'student_id'], 'integer'],
            [['relationship'], 'string', 'max' => 255],
            [['parent_id', 'student_id'], 'unique', 'targetAttribute' => ['parent_id', 'student_id']],
            [['parent_id'], 'exist', 'skipOnError' => true, 'targetClass' => ParentModel::class, 'targetAttribute' => ['parent_id' => 'id']],
            [['student_id'], 'exist', 'skipOnError' => true, 'targetClass' => Student::class, 'targetAttribute' => ['student_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'parent_id' => 'Parent ID',
            'student_id' => 'Student ID',
            'relationship' => 'Relationship',
        ];
    }

    public function getParent()
    {
        return $this->hasOne(ParentModel::class, ['id' => 'parent_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }
}
