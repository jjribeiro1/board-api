export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER');

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
