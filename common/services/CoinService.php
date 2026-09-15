<?php

namespace common\services;

use Yii;
use common\models\CoinTransaction;
use common\models\CoinReward;
use common\models\RewardRedemption;
use common\models\Student;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

class CoinService
{
    /**
     * Calculate live balance from ledger
     */
    public function getBalance($studentId)
    {
        return (int)CoinTransaction::find()
            ->where(['student_id' => $studentId])
            ->sum('amount') ?: 0;
    }

    /**
     * Award coins to a student (Credit)
     */
    public function awardCoins($studentId, $amount, $reason, $refType = null, $refId = null, $userId = null)
    {
        $amount = abs((int)$amount);
        if ($amount === 0) {
            throw new BadRequestHttpException('Coin miqdori 0 dan katta bo\'lishi shart.');
        }

        $student = Student::findOne($studentId);
        if (!$student) {
            throw new NotFoundHttpException('O\'quvchi topilmadi.');
        }

        $tx = new CoinTransaction();
        $tx->student_id = $studentId;
        $tx->amount = $amount;
        $tx->type = CoinTransaction::TYPE_CREDIT;
        $tx->reason = $reason;
        $tx->reference_type = $refType;
        $tx->reference_id = $refId;
        $tx->created_by = $userId;
        $tx->created_at = time();

        if (!$tx->save()) {
            throw new BadRequestHttpException('Tranzaksiyani saqlashda xatolik: ' . json_encode($tx->errors));
        }

        return [
            'success' => true,
            'transaction' => $tx,
            'new_balance' => $this->getBalance($studentId),
        ];
    }

    /**
     * Spend coins (Debit)
     */
    public function spendCoins($studentId, $amount, $reason, $refType = null, $refId = null, $userId = null)
    {
        $amount = abs((int)$amount);
        if ($amount === 0) {
            throw new BadRequestHttpException('Coin miqdori 0 dan katta bo\'lishi shart.');
        }

        $currentBalance = $this->getBalance($studentId);
        if ($currentBalance < $amount) {
            throw new BadRequestHttpException('O\'quvchida yetarli coin mavjud emas. Joriy balans: ' . $currentBalance . ' coin.');
        }

        $tx = new CoinTransaction();
        $tx->student_id = $studentId;
        $tx->amount = -$amount; // Negative for debit in ledger
        $tx->type = CoinTransaction::TYPE_DEBIT;
        $tx->reason = $reason;
        $tx->reference_type = $refType;
        $tx->reference_id = $refId;
        $tx->created_by = $userId;
        $tx->created_at = time();

        if (!$tx->save()) {
            throw new BadRequestHttpException('Tranzaksiyani saqlashda xatolik: ' . json_encode($tx->errors));
        }

        return [
            'success' => true,
            'transaction' => $tx,
            'new_balance' => $this->getBalance($studentId),
        ];
    }

    /**
     * Redeem a reward from school market
     */
    public function redeemReward($studentId, $rewardId, $userId = null)
    {
        $reward = CoinReward::findOne($rewardId);
        if (!$reward || !$reward->is_active) {
            throw new NotFoundHttpException('Sovg\'a topilmadi yoki faol emas.');
        }

        if ($reward->stock_quantity <= 0) {
            throw new BadRequestHttpException('Ushbu sovg\'a zaxirada qolmagan.');
        }

        $dbTransaction = Yii::$app->db->beginTransaction();
        try {
            // Spend coins
            $this->spendCoins(
                $studentId,
                $reward->coins_cost,
                $reward->title . ' sovg\'asi xaridi',
                'reward_redemption',
                $reward->id,
                $userId
            );

            // Decrement stock
            $reward->stock_quantity = max(0, $reward->stock_quantity - 1);
            $reward->save(false);

            // Record redemption order
            $redemption = new RewardRedemption();
            $redemption->student_id = $studentId;
            $redemption->coin_reward_id = $reward->id;
            $redemption->coins_spent = $reward->coins_cost;
            $redemption->status = RewardRedemption::STATUS_PENDING;
            $redemption->save(false);

            $dbTransaction->commit();
            return [
                'success' => true,
                'redemption' => $redemption,
                'reward' => $reward,
                'new_balance' => $this->getBalance($studentId),
            ];
        } catch (\Exception $e) {
            $dbTransaction->rollBack();
            throw $e;
        }
    }

    /**
     * Top students leaderboard
     */
    public function getLeaderboard($limit = 10)
    {
        $rows = (new \yii\db\Query())
            ->select([
                't.student_id',
                'total_coins' => 'SUM(t.amount)',
                's.student_code',
                'u.first_name',
                'u.last_name',
                'u.avatar'
            ])
            ->from(['t' => '{{%coin_transaction}}'])
            ->innerJoin(['s' => '{{%student}}'], 's.id = t.student_id')
            ->innerJoin(['u' => '{{%user}}'], 'u.id = s.user_id')
            ->groupBy(['t.student_id', 's.student_code', 'u.first_name', 'u.last_name', 'u.avatar'])
            ->orderBy(['total_coins' => SORT_DESC])
            ->limit($limit)
            ->all();

        return $rows;
    }
}
