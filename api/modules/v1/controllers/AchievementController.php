<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\data\ActiveDataProvider;
use common\models\Achievement;
use common\services\AchievementService;
use Yii;
use yii\web\BadRequestHttpException;

class AchievementController extends ActiveController
{
    public $modelClass = 'common\models\Achievement';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $query = Achievement::find()->with(['studentAchievements.student.user']);

        $category = Yii::$app->request->get('category');
        if ($category) {
            $query->andWhere(['category' => $category]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['id' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);
    }

    public function actionAward()
    {
        $req = Yii::$app->request->post();
        $studentId = $req['student_id'] ?? null;
        $achievementId = $req['achievement_id'] ?? null;
        $notes = $req['notes'] ?? null;
        $userId = Yii::$app->user->id;

        if (!$studentId || !$achievementId) {
            throw new BadRequestHttpException('student_id va achievement_id maydonlari to\'ldirilishi shart.');
        }

        $service = new AchievementService();
        return $service->awardAchievement($studentId, $achievementId, $notes, $userId);
    }
}
