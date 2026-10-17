import type { StaffRole } from '../generated/prisma/enums';

/** Claims carried in the access token. */
export interface JwtPayload {
  sub: string; // user id
  org: string; // organization id
  mid: string; // membership id
  role: StaffRole;
  sid: string; // session id
}

/** What guards attach to `request.user` for an authenticated dashboard call. */
export interface AuthContext {
  userId: string;
  organizationId: string;
  membershipId: string;
  sessionId: string;
  role: StaffRole;
  name: string;
  email: string;
}

/** What the device API key guard attaches for gateway / IoT bridge calls. */
export interface DeviceContext {
  gatewayId: string;
  organizationId: string;
  farmId: string;
}
