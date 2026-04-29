import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          EMAIL_HOST: 'smtp.test.com',
          EMAIL_PORT: 587,
          EMAIL_SECURE: false,
          EMAIL_USER: 'test@example.com',
          EMAIL_PASSWORD: 'password',
          EMAIL_FROM: 'noreply@test.com',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock the transporter
    (service as any).transporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    } as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const orderData = {
        orderId: 'ord_123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [
          {
            name: 'Product 1',
            quantity: 2,
            price: 50,
            total: 100,
          },
        ],
        subtotal: 100,
        discount: 10,
        shipping: 5,
        total: 95,
        address: '123 Street',
        city: 'City',
        province: 'Province',
        postalCode: '12345',
      };

      await service.sendOrderConfirmation(orderData);

      expect((service as any).transporter.sendMail).toHaveBeenCalled();
      const callArgs = ((service as any).transporter.sendMail as jest.Mock).mock.calls[0][0];
      expect(callArgs.to).toBe('john@example.com');
      expect(callArgs.subject).toContain('Order Confirmation');
      expect(callArgs.html).toContain('Product 1');
    });

    it('should handle email sending errors gracefully', async () => {
      const orderData = {
        orderId: 'ord_123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        address: '123 Street',
        city: 'City',
        province: 'Province',
        postalCode: '12345',
      };

      ((service as any).transporter.sendMail as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP Error'),
      );

      // Should not throw error
      await expect(
        service.sendOrderConfirmation(orderData),
      ).resolves.not.toThrow();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const email = 'newuser@example.com';
      const firstName = 'John';

      await service.sendWelcomeEmail(email, firstName);

      expect((service as any).transporter.sendMail).toHaveBeenCalled();
      const callArgs = ((service as any).transporter.sendMail as jest.Mock).mock.calls[0][0];
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toContain('Welcome');
      expect(callArgs.html).toContain('John');
    });

    it('should handle welcome email errors gracefully', async () => {
      ((service as any).transporter.sendMail as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP Error'),
      );

      // Should not throw error
      await expect(
        service.sendWelcomeEmail('test@example.com', 'Test'),
      ).resolves.not.toThrow();
    });
  });
});
