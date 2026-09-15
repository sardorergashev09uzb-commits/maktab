<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Announcement extends ActiveRecord
{
    const ROLE_ALL = 'all';
    const ROLE_TEACHERS = 'teachers';
    const ROLE_STUDENTS = 'students';
    const ROLE_PARENTS = 'parents';

    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    public static function tableName()
    {
        return '{{%announcement}}';
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
            [['title', 'content', 'published_at'], 'required'],
            [['content'], 'string'],
            [['is_published'], 'boolean'],
            [['author_id', 'published_at', 'expires_at', 'created_at', 'updated_at'], 'integer'],
            [['title'], 'string', 'max' => 255],
            [['target_role'], 'string', 'max' => 30],
            [['priority'], 'string', 'max' => 20],
        ];
    }

    public function getAuthor()
    {
        return $this->hasOne(User::class, ['id' => 'author_id']);
    }

    public function extraFields()
    {
        return ['author'];
    }
}
