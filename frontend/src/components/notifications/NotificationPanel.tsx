"use client";

import { Bell, Check, X } from "lucide-react";
import { Notification } from "@/src/hooks/useNotifications";
import Image from "next/image";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) {
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "lesson_report":
        return "/svg/Trophy.svg";
      case "inactivity_reminder":
        return "/svg/Fire.svg";
      case "weekly_report":
        return "/svg/Medal.svg";
      default:
        return "/svg/BellSimpleRinging.svg";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} минутын өмнө`;
    if (diffHours < 24) return `${diffHours} цагийн өмнө`;
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[#58CC02]" />
          <h3 className="font-bold text-lg font-nunito text-[#333333]">
            Мэдэгдэл
          </h3>
          {unreadNotifications.length > 0 && (
            <span className="bg-[#58CC02] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadNotifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-[#58CC02] hover:text-[#46A302] transition-colors font-nunito"
            >
              Бүгдийг уншсан
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-semibold font-nunito text-center">
              Мэдэгдэл байхгүй байна
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? "bg-[#58CC02]/5" : ""
              }`}
              onClick={() =>
                !notification.read && onMarkAsRead(notification.id)
              }
            >
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-[#58CC02]/10 rounded-full flex items-center justify-center">
                  <Image
                    src={getNotificationIcon(notification.type)}
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-[#333333] font-nunito">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#58CC02] rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-nunito mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 font-nunito">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
