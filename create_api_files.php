<?php
$basePath = __DIR__;

// Create directories
$dirs = [
    'api/web',
    'api/config',
    'api/modules/v1/controllers',
    'console/migrations'
];

foreach ($dirs as $dir) {
    if (!is_dir($basePath . '/' . $dir)) {
        mkdir($basePath . '/' . $dir, 0777, true);
    }
}

// 1. Entry Point
file_put_contents($basePath . '/api/web/index.php', "<?php\nrequire __DIR__ . '/../../vendor/autoload.php';\nrequire __DIR__ . '/../../vendor/yiisoft/yii2/Yii.php';\nrequire __DIR__ . '/../../common/config/bootstrap.php';\n\n\$config = yii\helpers\ArrayHelper::merge(\n    require __DIR__ . '/../../common/config/main.php',\n    require __DIR__ . '/../../common/config/main-local.php',\n    require __DIR__ . '/../../api/config/main.php'\n);\n\n\$application = new yii\web\Application(\$config);\n\$application->run();\n");

file_put_contents($basePath . '/api/web/.htaccess', "RewriteEngine on\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . index.php\n");

// 2. Config
file_put_contents($basePath . '/api/config/main.php', "<?php\nreturn [\n    'id' => 'app-api',\n    'basePath' => dirname(__DIR__),\n    'controllerNamespace' => 'api\controllers',\n    'bootstrap' => ['log'],\n    'modules' => [\n        'v1' => [\n            'class' => 'api\modules\v1\Module',\n        ],\n    ],\n    'components' => [\n        'request' => [\n            'parsers' => [\n                'application/json' => 'yii\web\JsonParser',\n            ],\n            'enableCsrfValidation' => false,\n        ],\n        'response' => [\n            'format' => yii\web\Response::FORMAT_JSON,\n        ],\n        'user' => [\n            'identityClass' => 'common\models\User',\n            'enableSession' => false,\n            'loginUrl' => null,\n        ],\n        'urlManager' => [\n            'enablePrettyUrl' => true,\n            'showScriptName' => false,\n            'rules' => [\n                [\n                    'class' => 'yii\rest\UrlRule',\n                    'controller' => [\n                        'v1/student',\n                        'v1/teacher',\n                        'v1/school-class',\n                        'v1/subject',\n                        'v1/academic-year',\n                        'v1/term',\n                        'v1/room',\n                        'v1/enrollment',\n                        'v1/teacher-assignment',\n                    ],\n                ],\n                'POST v1/auth/login' => 'v1/auth/login',\n                'POST v1/auth/register' => 'v1/auth/register',\n                'GET v1/auth/profile' => 'v1/auth/profile',\n                'POST v1/auth/logout' => 'v1/auth/logout',\n            ],\n        ],\n    ],\n    'as corsFilter' => [\n        'class' => \yii\filters\Cors::class,\n    ],\n];\n");

// 3. Module
file_put_contents($basePath . '/api/modules/v1/Module.php', "<?php\nnamespace api\modules\v1;\n\nclass Module extends \yii\base\Module\n{\n    public \$controllerNamespace = 'api\modules\v1\controllers';\n}\n");

// 4. Auth Controller
file_put_contents($basePath . '/api/modules/v1/controllers/AuthController.php', "<?php\nnamespace api\modules\v1\controllers;\n\nuse Yii;\nuse yii\rest\Controller;\nuse yii\filters\auth\HttpBearerAuth;\nuse common\models\User;\n\nclass AuthController extends Controller\n{\n    public function behaviors()\n    {\n        \$behaviors = parent::behaviors();\n        \$behaviors['authenticator'] = [\n            'class' => HttpBearerAuth::class,\n            'except' => ['login', 'register'],\n        ];\n        return \$behaviors;\n    }\n\n    public function actionLogin()\n    {\n        \$request = Yii::\$app->request;\n        \$username = \$request->post('username');\n        \$password = \$request->post('password');\n\n        \$user = User::findByUsername(\$username);\n        if (\$user && \$user->validatePassword(\$password)) {\n            if (method_exists(\$user, 'generateAccessToken')) {\n                \$user->generateAccessToken();\n            } else {\n                \$user->access_token = Yii::\$app->security->generateRandomString();\n            }\n            \$user->save(false);\n\n            \$roles = [];\n            if (method_exists(\$user, 'getRoles') && \$user->roles) {\n                \$roles = array_column(\$user->roles, 'name');\n            }\n\n            return [\n                'token' => \$user->access_token,\n                'user' => [\n                    'id' => \$user->id,\n                    'username' => \$user->username,\n                    'email' => \$user->email,\n                    'first_name' => \$user->first_name,\n                    'last_name' => \$user->last_name,\n                    'roles' => \$roles,\n                ]\n            ];\n        }\n\n        Yii::\$app->response->statusCode = 401;\n        return ['message' => 'Invalid username or password'];\n    }\n\n    public function actionRegister()\n    {\n        \$request = Yii::\$app->request;\n        \n        \$user = new User();\n        \$user->username = \$request->post('username');\n        \$user->email = \$request->post('email');\n        \$user->setPassword(\$request->post('password'));\n        \$user->generateAuthKey();\n        if (method_exists(\$user, 'generateAccessToken')) {\n            \$user->generateAccessToken();\n        } else {\n            \$user->access_token = Yii::\$app->security->generateRandomString();\n        }\n        \$user->first_name = \$request->post('first_name');\n        \$user->last_name = \$request->post('last_name');\n        \$user->status = User::STATUS_ACTIVE;\n\n        if (\$user->save()) {\n            return [\n                'token' => \$user->access_token,\n                'user' => [\n                    'id' => \$user->id,\n                    'username' => \$user->username,\n                    'email' => \$user->email,\n                    'first_name' => \$user->first_name,\n                    'last_name' => \$user->last_name,\n                    'roles' => [],\n                ]\n            ];\n        }\n\n        Yii::\$app->response->statusCode = 422;\n        return \$user->errors;\n    }\n\n    public function actionProfile()\n    {\n        \$user = Yii::\$app->user->identity;\n        \$roles = [];\n        if (method_exists(\$user, 'getRoles') && \$user->roles) {\n            \$roles = array_column(\$user->roles, 'name');\n        }\n        return [\n            'id' => \$user->id,\n            'username' => \$user->username,\n            'email' => \$user->email,\n            'first_name' => \$user->first_name,\n            'last_name' => \$user->last_name,\n            'roles' => \$roles,\n        ];\n    }\n\n    public function actionLogout()\n    {\n        \$user = Yii::\$app->user->identity;\n        \$user->access_token = null;\n        \$user->save(false);\n        Yii::\$app->user->logout();\n        return ['message' => 'Logged out successfully'];\n    }\n}\n");

// Active Controllers
$controllers = [
    'Student' => 'Student',
    'Teacher' => 'Teacher',
    'SchoolClass' => 'SchoolClass',
    'Subject' => 'Subject',
    'AcademicYear' => 'AcademicYear',
    'Term' => 'Term',
    'Room' => 'Room',
    'Enrollment' => 'Enrollment',
    'TeacherAssignment' => 'TeacherAssignment',
];

foreach ($controllers as $name => $model) {
    $content = "<?php\nnamespace api\modules\v1\controllers;\n\nuse yii\rest\ActiveController;\nuse yii\filters\auth\HttpBearerAuth;\nuse yii\filters\Cors;\n\nclass {$name}Controller extends ActiveController\n{\n    public \$modelClass = 'common\models\\{$model}';\n\n    public function behaviors()\n    {\n        \$behaviors = parent::behaviors();\n        \n        unset(\$behaviors['authenticator']);\n        \n        \$behaviors['corsFilter'] = [\n            'class' => Cors::class,\n        ];\n        \n        \$behaviors['authenticator'] = [\n            'class' => HttpBearerAuth::class,\n        ];\n        \n        return \$behaviors;\n    }\n}\n";
    file_put_contents($basePath . "/api/modules/v1/controllers/{$name}Controller.php", $content);
}

echo "API structure created successfully.";
