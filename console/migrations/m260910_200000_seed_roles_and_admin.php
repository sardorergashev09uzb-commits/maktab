<?php

use yii\db\Migration;

/**
 * Class m260910_200000_seed_roles_and_admin
 */
class m260910_200000_seed_roles_and_admin extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Add roles
        $roles = ['super_admin', 'admin', 'director', 'zavuch', 'accountant', 'teacher', 'student', 'parent'];
        foreach ($roles as $role) {
            $this->insert('role', [
                'name' => $role,
                'display_name' => ucfirst(str_replace('_', ' ', $role)),
                'description' => ucfirst(str_replace('_', ' ', $role)),
                'created_at' => time(),
                'updated_at' => time(),
            ]);
        }

        // Add super_admin user
        $this->insert('user', [
            'username' => 'admin',
            'email' => 'admin@maktab.uz',
            'password_hash' => Yii::$app->security->generatePasswordHash('admin123'),
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'status' => 10, // STATUS_ACTIVE
            'auth_key' => Yii::$app->security->generateRandomString(),
            'access_token' => Yii::$app->security->generateRandomString(),
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $userId = $this->db->getLastInsertID();
        $roleId = (new \yii\db\Query())->select('id')->from('role')->where(['name' => 'super_admin'])->scalar();

        if ($userId && $roleId) {
            $this->insert('user_role', [
                'user_id' => $userId,
                'role_id' => $roleId,
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $userId = (new \yii\db\Query())->select('id')->from('user')->where(['username' => 'admin'])->scalar();
        $roleId = (new \yii\db\Query())->select('id')->from('role')->where(['name' => 'super_admin'])->scalar();

        if ($userId && $roleId) {
            $this->delete('user_role', ['user_id' => $userId, 'role_id' => $roleId]);
        }
        if ($userId) {
            $this->delete('user', ['id' => $userId]);
        }
        $this->delete('role', ['name' => ['super_admin', 'admin', 'director', 'zavuch', 'accountant', 'teacher', 'student', 'parent']]);
    }
}
