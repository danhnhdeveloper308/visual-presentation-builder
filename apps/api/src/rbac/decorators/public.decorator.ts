import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Bỏ qua AuthGuard cho route này (health, login, register, refresh...). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
