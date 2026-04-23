import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderRequest {
  amount: number;
  userId: number;
  plan: string;
}

export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
  plan: string;
  amount: number;
  paymentMode: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = `http://localhost:8080/api/v1/payment`; // API Gateway route

  constructor(private http: HttpClient) { }

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/create-order`, request);
  }

  verifyPayment(request: PaymentVerificationRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify`, request);
  }

  getActiveSubscription(userId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/v1/subscription/active/${userId}`);
  }
}
