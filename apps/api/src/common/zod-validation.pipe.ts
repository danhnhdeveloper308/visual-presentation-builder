import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validate body bằng zod schema từ @repo/shared — một nguồn rule duy nhất với FE.
 * Dùng: `@Body(new ZodValidationPipe(loginSchema)) body: LoginInput`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join('.')}: ${i.message}` : i.message,
        ),
      );
    }
    return result.data;
  }
}
