<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%schedule}}".
 *
 * @property int $id
 * @property int $academic_year_id
 * @property int $school_class_id
 * @property int $subject_id
 * @property int $teacher_id
 * @property int|null $room_id
 * @property int $day_of_week
 * @property string $start_time
 * @property string $end_time
 * @property int|null $status
 * @property int|null $created_at
 * @property int|null $updated_at
 *
 * @property AcademicYear $academicYear
 * @property SchoolClass $schoolClass
 * @property Subject $subject
 * @property Teacher $teacher
 * @property Room $room
 * @property Lesson[] $lessons
 */
class Schedule extends ActiveRecord
{
    public const DAY_MON = 1;
    public const DAY_TUE = 2;
    public const DAY_WED = 3;
    public const DAY_THU = 4;
    public const DAY_FRI = 5;
    public const DAY_SAT = 6;
    public const DAY_SUN = 7;

    public static function tableName()
    {
        return '{{%schedule}}';
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
            [['academic_year_id', 'school_class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time'], 'required'],
            [['academic_year_id', 'school_class_id', 'subject_id', 'teacher_id', 'room_id', 'day_of_week', 'status', 'created_at', 'updated_at'], 'integer'],
            [['start_time', 'end_time'], 'safe'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'academic_year_id' => 'Academic Year ID',
            'school_class_id' => 'School Class ID',
            'subject_id' => 'Subject ID',
            'teacher_id' => 'Teacher ID',
            'room_id' => 'Room ID',
            'day_of_week' => 'Day Of Week',
            'start_time' => 'Start Time',
            'end_time' => 'End Time',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }

    public function getSchoolClass()
    {
        return $this->hasOne(SchoolClass::class, ['id' => 'school_class_id']);
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::class, ['id' => 'subject_id']);
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'teacher_id']);
    }

    public function getRoom()
    {
        return $this->hasOne(Room::class, ['id' => 'room_id']);
    }

    public function getLessons()
    {
        return $this->hasMany(Lesson::class, ['schedule_id' => 'id']);
    }
}
