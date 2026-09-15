<?php
namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\User;

class AuthController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['login', 'register'],
        ];
        return $behaviors;
    }

    public function actionLogin()
    {
        $request = Yii::$app->request;
        $username = $request->post('username');
        $password = $request->post('password');

        $user = User::findByUsername($username);
        if ($user && $user->validatePassword($password)) {
            if (method_exists($user, 'generateAccessToken')) {
                $user->generateAccessToken();
            } else {
                $user->access_token = Yii::$app->security->generateRandomString();
            }
            $user->save(false);

            $roles = [];
            if (method_exists($user, 'getRoles') && $user->roles) {
                $roles = array_column($user->roles, 'name');
            }

            return [
                'token' => $user->access_token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'roles' => $roles,
                ]
            ];
        }

        Yii::$app->response->statusCode = 401;
        return ['message' => 'Invalid username or password'];
    }

    public function actionRegister()
    {
        $request = Yii::$app->request;
        
        $user = new User();
        $user->username = $request->post('username');
        $user->email = $request->post('email');
        $user->setPassword($request->post('password'));
        $user->generateAuthKey();
        if (method_exists($user, 'generateAccessToken')) {
            $user->generateAccessToken();
        } else {
            $user->access_token = Yii::$app->security->generateRandomString();
        }
        $user->first_name = $request->post('first_name');
        $user->last_name = $request->post('last_name');
        $user->status = User::STATUS_ACTIVE;

        if ($user->save()) {
            return [
                'token' => $user->access_token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'roles' => [],
                ]
            ];
        }

        Yii::$app->response->statusCode = 422;
        return $user->errors;
    }

    public function actionProfile()
    {
        $user = Yii::$app->user->identity;
        $roles = [];
        if (method_exists($user, 'getRoles') && $user->roles) {
            $roles = array_column($user->roles, 'name');
        }
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'roles' => $roles,
        ];
    }

    public function actionChangePassword()
    {
        $user = Yii::$app->user->identity;
        if (!$user) {
            Yii::$app->response->statusCode = 401;
            return ['message' => 'Avtorizatsiyadan o\'tilmagan'];
        }

        $request = Yii::$app->request;
        $oldPassword = $request->post('old_password');
        $newPassword = $request->post('new_password');

        if (!$oldPassword || !$newPassword) {
            Yii::$app->response->statusCode = 422;
            return ['message' => 'Eski va yangi parollar kiritilishi shart'];
        }

        if (strlen($newPassword) < 6) {
            Yii::$app->response->statusCode = 422;
            return ['message' => 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'];
        }

        if (!$user->validatePassword($oldPassword)) {
            Yii::$app->response->statusCode = 422;
            return ['message' => 'Amaldagi (eski) parol noto\'g\'ri kiritildi'];
        }

        $user->setPassword($newPassword);
        $user->generateAccessToken();
        $user->save(false);

        // Audit log if exists
        try {
            \common\models\AuditLog::log('auth.change_password', 'user', $user->id, [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);
        } catch (\Exception $e) {}

        return [
            'success' => true,
            'message' => 'Parolingiz muvaffaqiyatli o\'zgartirildi',
            'token' => $user->access_token,
        ];
    }

    public function actionLogout()
    {
        $user = Yii::$app->user->identity;
        $user->access_token = null;
        $user->save(false);
        Yii::$app->user->logout();
        return ['message' => 'Logged out successfully'];
    }
}
