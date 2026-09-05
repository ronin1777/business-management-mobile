import { apiRequest } from "./client";
import {
  clearTokens,
  setTokens,
  setAccessToken,
} from "./token-storage";

type User = {
  id: number;
  username: string;
};

type AuthResponse = {
  success: boolean;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
  message: string | null;
  errors: unknown;
};

type RefreshResponse = {
  success: boolean;
  data: {
    access: string;
  };
  message: string | null;
  errors: unknown;
};

type RegisterResponse = {
  success: boolean;
  data: {
    user: User;
  };
  message: string | null;
  errors: unknown;
};

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/auth/mobile/login/",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );

  await setTokens(
    response.data.access,
    response.data.refresh,
  );

  return response;
}

export async function register(
  username: string,
  firstName: string,
  lastName: string,
  password: string,
  organizationName: string,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(
    "/auth/mobile/register/",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
        password,
        organization_name: organizationName,
      }),
    },
  );
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    await import("./token-storage").then(
      ({ getRefreshToken }) => getRefreshToken(),
    );

  if (!refreshToken) {
    throw new Error(
      "Refresh Token یافت نشد.",
    );
  }

  const response =
    await apiRequest<RefreshResponse>(
      "/auth/mobile/refresh/",
      {
        method: "POST",
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      },
    );

  await setAccessToken(
    response.data.access,
  );

  return response.data.access;
}

export async function logout(): Promise<void> {
  const refreshToken =
    await import("./token-storage").then(
      ({ getRefreshToken }) => getRefreshToken(),
    );

  try {
    if (refreshToken) {
      await apiRequest(
        "/auth/mobile/logout/",
        {
          method: "POST",
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        },
      );
    }
  } finally {
    await clearTokens();
  }
}