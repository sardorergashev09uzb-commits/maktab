<?php

namespace common\services;

use Yii;
use common\models\Notification;
use common\models\Announcement;
use common\models\User;

class NotificationService
{
    /**
     * Send notification to a specific user
     */
    public function sendNotification($userId, $title, $message, $type = 'general', $linkUrl = null)
    {
        $notif = new Notification();
        $notif->user_id = $userId;
        $notif->title = $title;
        $notif->message = $message;
        $notif->type = $type;
        $notif->link_url = $linkUrl;
        $notif->is_read = false;
        $notif->created_at = time();
        $notif->save(false);

        return $notif;
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId, $userId)
    {
        $notif = Notification::findOne(['id' => $notificationId, 'user_id' => $userId]);
        if ($notif) {
            $notif->is_read = true;
            $notif->read_at = time();
            $notif->save(false);
            return true;
        }
        return false;
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount($userId)
    {
        return (int)Notification::find()
            ->where(['user_id' => $userId, 'is_read' => false])
            ->count();
    }
}
