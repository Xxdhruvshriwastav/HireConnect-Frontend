import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  notificationId?: number;
  userId: string;
  type: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/v1/notifications';

  constructor(private http: HttpClient) {}

  sendNotification(notification: Notification): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, notification);
  }

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}`);
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/user/${userId}/unread-count`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${userId}/read-all`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
