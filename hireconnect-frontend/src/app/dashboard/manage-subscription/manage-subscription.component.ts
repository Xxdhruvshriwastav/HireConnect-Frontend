import { Component, OnInit } from '@angular/core';
import { PaymentService, OrderRequest, PaymentVerificationRequest } from '../../services/payment.service';

declare var Razorpay: any;

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.scss']
})
export class ManageSubscriptionComponent implements OnInit {

  recruiterPlans: Plan[] = [
    { id: 'FREE', name: 'Free', price: 0, features: ['1 Job Posting', 'Basic Support'] },
    { id: 'PROFESSIONAL', name: 'Professional', price: 999, features: ['10 Job Postings', 'Priority Support', 'Candidate Search'] },
    { id: 'ENTERPRISE', name: 'Enterprise', price: 4999, features: ['Unlimited Postings', 'Dedicated AM', 'Advanced Analytics'] }
  ];

  candidatePlans: Plan[] = [
    { id: 'CANDIDATE_FREE', name: 'Basic', price: 0, features: ['Apply to 10 Jobs/day', 'Standard Profile'] },
    { id: 'CANDIDATE_PRO', name: 'Pro Candidate', price: 299, features: ['Unlimited Applications', 'Highlighted Profile', 'Priority Support'] }
  ];

  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  paymentMode: string = 'CARD';
  userId: number = 0;
  userRole: string = '';
  activeSubscription: any = null;
  isProcessing: boolean = false;
  message: string = '';

  constructor(
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userId = user.id || user.userId;
      this.userRole = user.role;
    } else {
      // Fallback for existing sessions
      this.userRole = localStorage.getItem('role') || '';
      const userIdStr = localStorage.getItem('userId');
      this.userId = userIdStr ? parseInt(userIdStr) : 0;
    }

    if (this.userId || this.userRole) {
      this.plans = this.userRole === 'RECRUITER' ? this.recruiterPlans : this.candidatePlans;
      this.fetchActiveSubscription();
    }
  }

  fetchActiveSubscription() {
    this.paymentService.getActiveSubscription(this.userId).subscribe({
      next: (sub) => {
        if (sub) {
          this.activeSubscription = sub;
          // Pre-select the current plan if it's in our list
          this.selectedPlan = this.plans.find(p => p.id === sub.plan) || null;
        }
      },
      error: (err) => {
        console.error('Error fetching active subscription:', err);
      }
    });
  }

  selectPlan(plan: Plan) {
    this.selectedPlan = plan;
    this.message = '';
  }

  payNow() {
    if (!this.selectedPlan || this.selectedPlan.price === 0) {
      this.message = 'Please select a paid plan or use free features.';
      return;
    }

    this.isProcessing = true;
    this.message = '';

    const orderRequest: OrderRequest = {
      amount: this.selectedPlan.price,
      userId: this.userId,
      plan: this.selectedPlan.id
    };

    this.paymentService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.openRazorpay(order);
      },
      error: (err) => {
        this.isProcessing = false;
        this.message = 'Failed to create order. Please try again.';
        console.error(err);
      }
    });
  }

  openRazorpay(order: any) {
    const options = {
      key: 'rzp_test_SgAb8Khr35cMfn', // Test Key
      amount: order.amount,
      currency: order.currency,
      name: 'HireConnect Subscription',
      description: `Plan: ${this.selectedPlan?.name}`,
      order_id: order.orderId,
      handler: (response: any) => {
        this.verifyPayment(response);
      },
      prefill: {
        name: this.userRole === 'RECRUITER' ? 'Recruiter' : 'Candidate',
        email: 'user@hireconnect.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.isProcessing = false;
      this.message = 'Payment Failed: ' + response.error.description;
    });
    rzp.open();
  }

  verifyPayment(response: any) {
    const verifyRequest: PaymentVerificationRequest = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      userId: this.userId,
      plan: this.selectedPlan!.id,
      amount: this.selectedPlan!.price,
      paymentMode: this.paymentMode
    };

    this.paymentService.verifyPayment(verifyRequest).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.message = 'Payment Successful! Your subscription is now active.';
        this.fetchActiveSubscription(); // Refresh status
      },
      error: (err) => {
        this.isProcessing = false;
        this.message = 'Payment verification failed. Please contact support.';
        console.error(err);
      }
    });
  }
}
