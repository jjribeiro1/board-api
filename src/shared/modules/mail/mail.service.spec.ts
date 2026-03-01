import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { MailService } from './mail.service';
import { MAIL_PROVIDER, MailProvider, SendMailOptions } from './interfaces/mail-provider.interface';

describe('MailService', () => {
  let service: MailService;
  let mailProviderMock: DeepMockProxy<MailProvider>;

  beforeEach(async () => {
    mailProviderMock = mockDeep<MailProvider>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService, { provide: MAIL_PROVIDER, useValue: mailProviderMock }],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should call mailProvider.sendMail with correct options', async () => {
      const options: SendMailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };
      mailProviderMock.sendMail.mockResolvedValue();

      await service.send(options);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith(options);
      expect(mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple recipients', async () => {
      const options: SendMailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Subject',
        text: 'Test text',
      };
      mailProviderMock.sendMail.mockResolvedValue();

      await service.send(options);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith(options);
    });

    it('should pass all optional parameters to provider', async () => {
      const options: SendMailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
        from: 'sender@example.com',
        replyTo: 'reply@example.com',
        attachments: [
          {
            filename: 'document.pdf',
            content: Buffer.from('test'),
            contentType: 'application/pdf',
          },
        ],
      };
      mailProviderMock.sendMail.mockResolvedValue();

      await service.send(options);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith(options);
    });

    it('should propagate errors from mail provider', async () => {
      const options: SendMailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };
      const error = new Error('Mail provider error');
      mailProviderMock.sendMail.mockRejectedValue(error);

      await expect(service.send(options)).rejects.toThrow('Mail provider error');
    });
  });

  describe('sendHtml', () => {
    it('should send email with HTML content to single recipient', async () => {
      const to = 'user@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Welcome</h1>';
      mailProviderMock.sendMail.mockResolvedValue();

      await service.sendHtml(to, subject, html);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith({
        to,
        subject,
        html,
      });
    });

    it('should send email with HTML content to multiple recipients', async () => {
      const to = ['user1@example.com', 'user2@example.com'];
      const subject = 'Test Subject';
      const html = '<h1>Welcome</h1>';
      mailProviderMock.sendMail.mockResolvedValue();

      await service.sendHtml(to, subject, html);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith({
        to,
        subject,
        html,
      });
    });

    it('should propagate errors from mail provider', async () => {
      const to = 'user@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Welcome</h1>';
      const error = new Error('Failed to send HTML email');
      mailProviderMock.sendMail.mockRejectedValue(error);

      await expect(service.sendHtml(to, subject, html)).rejects.toThrow('Failed to send HTML email');
    });
  });

  describe('sendText', () => {
    it('should send email with text content to single recipient', async () => {
      const to = 'user@example.com';
      const subject = 'Test Subject';
      const text = 'Welcome to our platform';
      mailProviderMock.sendMail.mockResolvedValue();

      await service.sendText(to, subject, text);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith({
        to,
        subject,
        text,
      });
    });

    it('should send email with text content to multiple recipients', async () => {
      const to = ['user1@example.com', 'user2@example.com'];
      const subject = 'Test Subject';
      const text = 'Welcome to our platform';
      mailProviderMock.sendMail.mockResolvedValue();

      await service.sendText(to, subject, text);

      expect(mailProviderMock.sendMail).toHaveBeenCalledWith({
        to,
        subject,
        text,
      });
    });

    it('should propagate errors from mail provider', async () => {
      const to = 'user@example.com';
      const subject = 'Test Subject';
      const text = 'Welcome to our platform';
      const error = new Error('Failed to send text email');
      mailProviderMock.sendMail.mockRejectedValue(error);

      await expect(service.sendText(to, subject, text)).rejects.toThrow('Failed to send text email');
    });
  });
});
