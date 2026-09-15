<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Permission extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%permission}}';
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

    public function getRoles()
    {
        return $this->hasMany(Role::class, ['id' => 'role_id'])
            ->viaTable('{{%role_permission}}', ['permission_id' => 'id']);
    }
}
