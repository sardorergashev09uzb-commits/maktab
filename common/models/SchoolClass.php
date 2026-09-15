<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SchoolClass extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%school_class}}';
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
            [['academic_year_id', 'name', 'grade_level'], 'required'],
            [['academic_year_id', 'room_id', 'class_teacher_id', 'grade_level', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 255],
            [['academic_year_id'], 'exist', 'skipOnError' => true, 'targetClass' => AcademicYear::class, 'targetAttribute' => ['academic_year_id' => 'id']],
            [['room_id'], 'exist', 'skipOnError' => true, 'targetClass' => Room::class, 'targetAttribute' => ['room_id' => 'id']],
            [['class_teacher_id'], 'exist', 'skipOnError' => true, 'targetClass' => Teacher::class, 'targetAttribute' => ['class_teacher_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'academic_year_id' => 'Academic Year ID',
            'name' => 'Name',
            'grade_level' => 'Grade Level',
            'room_id' => 'Room ID',
            'class_teacher_id' => 'Class Teacher ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }

    public function getRoom()
    {
        return $this->hasOne(Room::class, ['id' => 'room_id']);
    }

    public function getClassTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'class_teacher_id']);
    }

    public function getEnrollments()
    {
        return $this->hasMany(Enrollment::class, ['school_class_id' => 'id']);
    }

    public function getStudents()
    {
        return $this->hasMany(Student::class, ['id' => 'student_id'])
            ->via('enrollments');
    }

    public function getTeacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, ['school_class_id' => 'id']);
    }

    public function extraFields()
    {
        return ['academicYear', 'room', 'enrollments', 'students', 'classTeacher', 'teacherAssignments'];
    }
}
