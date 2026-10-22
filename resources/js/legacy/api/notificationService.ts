import { apiClient, ApiResponse } from './client';

export type NotificationEvent =
  | 'BOOKING_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'SCHEDULE_REMINDER'
  | 'RESCHEDULED';

export interface NotificationLog {
  id: string;
  event: NotificationEvent;
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  sent_at?: string | null;
}

export interface DispatchNotificationPayload {
  event: NotificationEvent;
  channel?: 'WHATSAPP' | 'EMAIL';
}

export const notificationService = {
  listLogs(params?: { status?: string; event?: NotificationEvent; page?: number; per_page?: number }) {
    return apiClient.get<NotificationLog[]>('/notifications/logs', params);
  },

  resend(logId: string): Promise<ApiResponse<NotificationLog>> {
    return apiClient.post<NotificationLog>(`/notifications/${logId}/resend`, {});
  },

  sendAppointmentEvent(
    appointmentId: string,
    payload: DispatchNotificationPayload
  ): Promise<ApiResponse<NotificationLog>> {
    return apiClient.post<NotificationLog>(
      `/notifications/appointments/${appointmentId}/send`,
      payload
    );
  },

  sendDailyPsychologistReminder(date?: string): Promise<ApiResponse<NotificationLog[]>> {
    return apiClient.post<NotificationLog[]>('/notifications/reminders/daily', { date });
  }
};
