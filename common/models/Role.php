<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Role extends ActiveRecord
{
    const SUPER_ADMIN = 'super_admin';
    const ADMIN = 'admin';
    const DIRECTOR = 'director';
    const ZAVUCH = 'zavuch';
    const ACCOUNTANT = 'accountant';
    const TEACHER = 'teacher';
    const STUDENT = 'student';
    const PARENT = 'parent';

    public static function tableName()
    {
        return '{{%role}}';
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
            [['name'], 'required'],
            [['created_at', 'updated_at'], 'integer'],
            [['name', 'description'], 'string', 'max' => 255],
            [['name'], 'unique'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'description' => 'Description',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getPermissions()
    {
        return $this->hasMany(Permission::class, ['id' => 'permission_id'])
            ->viaTable('{{%role_permission}}', ['role_id' => 'id']);
    }

    public function getUsers()
    {
        return $this->hasMany(User::class, ['id' => 'user_id'])
            ->viaTable('{{%user_role}}', ['role_id' => 'id']);
    }
}
