import { createDefine } from 'fresh';
import type { User } from '@/types/index.ts';

export interface State {
  isAuthenticated: boolean;
  authToken: string | null;
  user?: User;
  title?: string;
}

export const define = createDefine<State>();

