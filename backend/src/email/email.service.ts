import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure email transporter
    // Using Gmail or your email service credentials
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: this.configService.get('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  @OnEvent('order.placed')
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    try {
      const itemsHtml = data.items
        .map(
          (item) =>
            `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.total.toFixed(2)}</td>
        </tr>
      `,
        )
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #34495e; color: white; padding: 10px; text-align: left; }
            .summary { margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .summary-row.total { font-weight: bold; font-size: 18px; border-bottom: 2px solid #2c3e50; padding-top: 15px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
              <p>Thank you for your purchase!</p>
            </div>
            <div class="content">
              <p>Hello ${data.customerName},</p>
              <p>Your order has been successfully placed. Here are the details:</p>
              
              <div class="order-info">
                <strong>Order ID:</strong> ${data.orderId}<br>
                <strong>Order Date:</strong> ${new Date().toLocaleDateString()}<br>
              </div>

              <h3>Order Items:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>$${data.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Discount:</span>
                  <span>-$${data.discount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>$${data.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <span>$${data.total.toFixed(2)}</span>
                </div>
              </div>

              <h3>Delivery Address:</h3>
              <p>
                ${data.address}<br>
                ${data.city}, ${data.province} ${data.postalCode}
              </p>

              <p>We will process your order and send you a tracking number soon!</p>
              <p>Thank you for shopping with VMS Super Mart!</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 VMS Super Mart. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM', 'noreply@vmssupermart.com'),
        to: data.customerEmail,
        subject: `Order Confirmation - Order #${data.orderId}`,
        html,
      });

      console.log(`Order confirmation email sent to ${data.customerEmail}`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't throw error - order should be created even if email fails
    }
  }

  @OnEvent('user.registered')
  async sendWelcomeEmail(payload: { email: string; firstName: string }): Promise<void> {
    const { email, firstName } = payload;
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to VMS Super Mart!</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <p>Thank you for creating an account with VMS Super Mart. We're excited to have you on board!</p>
              <p>You can now browse our wide selection of products and start shopping. Don't forget to check out our special deals and discounts!</p>
              <p>Happy shopping!</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 VMS Super Mart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM', 'noreply@vmssupermart.com'),
        to: email,
        subject: 'Welcome to VMS Super Mart!',
        html,
      });

      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}
