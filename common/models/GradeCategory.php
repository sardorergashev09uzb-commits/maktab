<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%grade_category}}".
 *
 * @property int $id
 * @property string $name
 * @property string $code
 * @property float|null $weight
 * @property int|null $max_score
 * @property int|null $status
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class GradeCategory extends ActiveRecord
{
    public const CODE_HOMEWORK = 'homework';
    public const CODE_CLASSWORK = 'classwork';
    public const CODE_CONTROL = 'control';
    public const CODE_PROJECT = 'project';
    public const CODE_EXAM = 'exam';
    public const CODE_FINAL = 'final';

    public static function tableName()
    {
        return '{{%grade_category}}';
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
            [['name', 'code'], 'required'],
            [['weight'], 'number'],
            [['max_score', 'status', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 100],
            [['code'], 'string', 'max' => 50],
            [['code'], 'unique'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'code' => 'Code',
            'weight' => 'Weight',
            'max_score' => 'Max Score',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getGrades()
    {
        return $this->hasMany(Grade::class, ['grade_category_id' => 'id']);
    }
}
