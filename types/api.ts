export type AuthUser = {
  id: string;
  email: string;
};

export type TokenPayload = AuthUser & {
  iat?: number;
  exp?: number;
};

export type RouteContext = {
  params: Record<string, string>;
};
