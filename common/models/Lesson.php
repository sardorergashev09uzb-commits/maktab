<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%lesson}}".
 *
 * @property int $id
 * @property int|null $schedule_id
 * @property int $academic_year_id
 * @property int $school_class_id
 * @property int $subject_id
 * @property int $teacher_id
 * @property int|null $room_id
 * @property string $date
 * @property string $start_time
 * @property string $end_time
 * @property string|null $topic
 * @property string|null $notes
 * @property int|null $status
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class Lesson extends ActiveRecord
{
    public const STATUS_SCHEDULED = 10;
    public const STATUS_IN_PROGRESS = 20;
    public const STATUS_COMPLETED = 30;
    public const STATUS_CANCELLED = 40;

    public static function tableName()
    {
        return '{{%lesson}}';
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
            [['academic_year_id', 'school_class_id', 'subject_id', 'teacher_id', 'date', 'start_time', 'end_time'], 'required'],
            [['schedule_id', 'academic_year_id', 'school_class_id', 'subject_id', 'teacher_id', 'room_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['date', 'start_time', 'end_time'], 'safe'],
            [['notes'], 'string'],
            [['topic'], 'string', 'max' => 255],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'schedule_id' => 'Schedule ID',
            'academic_year_id' => 'Academic Year ID',
            'school_class_id' => 'School Class ID',
            'subject_id' => 'Subject ID',
            'teacher_id' => 'Teacher ID',
            'room_id' => 'Room ID',
            'date' => 'Date',
            'start_time' => 'Start Time',
            'end_time' => 'End Time',
            'topic' => 'Topic',
            'notes' => 'Notes',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getSchedule()
    {
        return $this->hasOne(Schedule::class, ['id' => 'schedule_id']);
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

    public function getAttendances()
    {
        return $this->hasMany(Attendance::class, ['lesson_id' => 'id']);
    }

    public function getGrades()
    {
        return $this->hasMany(Grade::class, ['lesson_id' => 'id']);
    }

    public function getGradeOverrides()
    {
        return $this->hasMany(GradeOverride::class, ['lesson_id' => 'id']);
    }

    public function extraFields()
    {
        return ['schedule', 'academicYear', 'schoolClass', 'subject', 'teacher', 'room', 'attendances', 'grades', 'gradeOverrides'];
    }
}
