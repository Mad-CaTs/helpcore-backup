export interface TokenPayload {
  sub: string;
  correo: string;
  type: string;
  roles?: string[];
  rol?: string;
  iat: number;
  exp: number;
  jti: string;
}
