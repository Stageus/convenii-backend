import { Payload } from 'src/modules/auth/model/payload.model';

export class UserWithStatus {
  data: Payload;
  authStatus: 'true' | 'false' | 'expired';
}
