import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Global để mọi module (auth...) inject MailService không cần import lại. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
