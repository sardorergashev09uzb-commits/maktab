<?php

namespace common\services;

use Yii;
use common\models\Contract;
use common\models\Invoice;
use common\models\Payment;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

class FinanceService
{
    /**
     * Generate installment invoices for a contract
     */
    public function generateContractInvoices(Contract $contract)
    {
        $existing = Invoice::find()->where(['contract_id' => $contract->id])->count();
        if ($existing > 0) {
            throw new BadRequestHttpException('Ushbu shartnoma uchun invoyslar allaqachon shakllantirilgan.');
        }

        $netTotal = (float)$contract->total_amount - (float)$contract->discount_amount;
        $plan = $contract->payment_plan ?: 'monthly';
        $invoices = [];
        $transaction = Yii::$app->db->beginTransaction();

        try {
            if ($plan === 'annual') {
                $inv = new Invoice();
                $inv->contract_id = $contract->id;
                $inv->student_id = $contract->student_id;
                $inv->invoice_number = 'INV-' . $contract->contract_number . '-YIL';
                $inv->title = 'Yillik to\'liq o\'qish to\'lovi (' . $contract->contract_number . ')';
                $inv->amount = $netTotal;
                $inv->paid_amount = 0;
                $inv->due_date = $contract->start_date;
                $inv->status = Invoice::STATUS_PENDING;
                $inv->save(false);
                $invoices[] = $inv;
            } elseif ($plan === 'quarterly') {
                $installment = round($netTotal / 4, 2);
                $start = new \DateTime($contract->start_date);
                for ($q = 1; $q <= 4; $q++) {
                    $inv = new Invoice();
                    $inv->contract_id = $contract->id;
                    $inv->student_id = $contract->student_id;
                    $inv->invoice_number = 'INV-' . $contract->contract_number . '-CH' . $q;
                    $inv->title = $q . '-Chorak o\'qish to\'lovi (' . $contract->contract_number . ')';
                    $inv->amount = ($q === 4) ? ($netTotal - ($installment * 3)) : $installment;
                    $inv->paid_amount = 0;
                    $inv->due_date = $start->format('Y-m-d');
                    $inv->status = Invoice::STATUS_PENDING;
                    $inv->save(false);
                    $invoices[] = $inv;
                    $start->modify('+2 months 15 days');
                }
            } else {
                // Monthly (10 installments for academic school year)
                $installment = round($netTotal / 10, 2);
                $start = new \DateTime($contract->start_date);
                for ($m = 1; $m <= 10; $m++) {
                    $inv = new Invoice();
                    $inv->contract_id = $contract->id;
                    $inv->student_id = $contract->student_id;
                    $inv->invoice_number = 'INV-' . $contract->contract_number . '-M' . str_pad($m, 2, '0', STR_PAD_LEFT);
                    $inv->title = $start->format('F Y') . ' oyi o\'qish to\'lovi';
                    $inv->amount = ($m === 10) ? ($netTotal - ($installment * 9)) : $installment;
                    $inv->paid_amount = 0;
                    $inv->due_date = $start->format('Y-m-10');
                    $inv->status = Invoice::STATUS_PENDING;
                    $inv->save(false);
                    $invoices[] = $inv;
                    $start->modify('+1 month');
                }
            }

            $transaction->commit();
            return $invoices;
        } catch (\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }
    }

    /**
     * Record a payment safely within a transaction
     */
    public function recordPayment($invoiceId, $amount, $paymentMethod = 'cash', $transactionRef = null, $notes = null, $userId = null)
    {
        $invoice = Invoice::findOne($invoiceId);
        if (!$invoice) {
            throw new NotFoundHttpException('Invoys topilmadi.');
        }

        $amount = (float)$amount;
        if ($amount <= 0) {
            throw new BadRequestHttpException('To\'lov summasi musbat bo\'lishi shart.');
        }

        $remainingDue = (float)$invoice->amount - (float)$invoice->paid_amount;
        if ($amount > $remainingDue + 0.01) {
            throw new BadRequestHttpException('To\'lov summasi qoldiq qarzdorlikdan (' . number_format($remainingDue, 0, '', ' ') . ' so\'m) oshmasligi kerak.');
        }

        $dbTransaction = Yii::$app->db->beginTransaction();
        try {
            $payment = new Payment();
            $payment->payment_number = 'PAY-' . date('Ymd') . '-' . mt_rand(1000, 9999);
            $payment->invoice_id = $invoice->id;
            $payment->student_id = $invoice->student_id;
            $payment->amount = $amount;
            $payment->payment_date = date('Y-m-d');
            $payment->payment_method = $paymentMethod;
            $payment->transaction_reference = $transactionRef;
            $payment->notes = $notes;
            $payment->status = Payment::STATUS_CONFIRMED;

            if (!$payment->save()) {
                throw new BadRequestHttpException('To\'lovni saqlashda xatolik: ' . json_encode($payment->errors));
            }

            // Update Invoice paid amount & status
            $invoice->paid_amount = (float)$invoice->paid_amount + $amount;
            if ($invoice->paid_amount >= (float)$invoice->amount - 0.01) {
                $invoice->status = Invoice::STATUS_PAID;
            } else {
                $invoice->status = Invoice::STATUS_PARTIALLY_PAID;
            }
            $invoice->save(false);

            // Update Contract paid amount
            if ($invoice->contract_id) {
                $contract = Contract::findOne($invoice->contract_id);
                if ($contract) {
                    $contract->paid_amount = (float)$contract->paid_amount + $amount;
                    $netContract = (float)$contract->total_amount - (float)$contract->discount_amount;
                    if ($contract->paid_amount >= $netContract - 0.01) {
                        $contract->status = Contract::STATUS_COMPLETED;
                    }
                    $contract->save(false);
                }
            }

            $dbTransaction->commit();
            return [
                'success' => true,
                'payment' => $payment,
                'invoice' => $invoice,
            ];
        } catch (\Exception $e) {
            $dbTransaction->rollBack();
            throw $e;
        }
    }

    /**
     * Reverse / Cancel a mistaken payment
     */
    public function reversePayment($paymentId, $reason, $userId = null)
    {
        $payment = Payment::findOne($paymentId);
        if (!$payment) {
            throw new NotFoundHttpException('To\'lov topilmadi.');
        }

        if ($payment->status === Payment::STATUS_REVERSED) {
            throw new BadRequestHttpException('Ushbu to\'lov allaqachon bekor qilingan.');
        }

        $dbTransaction = Yii::$app->db->beginTransaction();
        try {
            $payment->status = Payment::STATUS_REVERSED;
            $payment->reversed_at = time();
            $payment->reversed_by = $userId;
            $payment->reversal_reason = $reason;
            $payment->save(false);

            // Adjust invoice
            $invoice = Invoice::findOne($payment->invoice_id);
            if ($invoice) {
                $invoice->paid_amount = max(0, (float)$invoice->paid_amount - (float)$payment->amount);
                if ($invoice->paid_amount <= 0) {
                    $invoice->status = Invoice::STATUS_PENDING;
                } else {
                    $invoice->status = Invoice::STATUS_PARTIALLY_PAID;
                }
                $invoice->save(false);
            }

            // Adjust contract
            if ($invoice && $invoice->contract_id) {
                $contract = Contract::findOne($invoice->contract_id);
                if ($contract) {
                    $contract->paid_amount = max(0, (float)$contract->paid_amount - (float)$payment->amount);
                    if ($contract->status === Contract::STATUS_COMPLETED) {
                        $contract->status = Contract::STATUS_ACTIVE;
                    }
                    $contract->save(false);
                }
            }

            $dbTransaction->commit();
            return [
                'success' => true,
                'payment' => $payment,
            ];
        } catch (\Exception $e) {
            $dbTransaction->rollBack();
            throw $e;
        }
    }

    /**
     * Financial statistics for dashboard
     */
    public function getFinancialStats()
    {
        $totalContracts = (float)Contract::find()->where(['status' => Contract::STATUS_ACTIVE])->sum('total_amount - discount_amount') ?: 0;
        $totalCollected = (float)Payment::find()->where(['status' => Payment::STATUS_CONFIRMED])->sum('amount') ?: 0;
        $totalDebt = (float)Invoice::find()->where(['in', 'status', [Invoice::STATUS_PENDING, Invoice::STATUS_PARTIALLY_PAID, Invoice::STATUS_OVERDUE]])->sum('amount - paid_amount') ?: 0;

        $overdueCount = (int)Invoice::find()
            ->where(['<', 'due_date', date('Y-m-d')])
            ->andWhere(['in', 'status', [Invoice::STATUS_PENDING, Invoice::STATUS_PARTIALLY_PAID]])
            ->count();

        $recentPayments = Payment::find()
            ->with(['student.user', 'invoice'])
            ->orderBy(['id' => SORT_DESC])
            ->limit(5)
            ->all();

        return [
            'total_contracted' => $totalContracts,
            'total_collected' => $totalCollected,
            'total_debt' => $totalDebt,
            'overdue_invoices_count' => $overdueCount,
            'recent_payments' => $recentPayments,
        ];
    }
}
