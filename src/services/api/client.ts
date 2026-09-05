import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "./token-storage";

const API_URL = "http://192.168.1.6:8000/api";

type ApiRequestOptions = RequestInit & {
  accessToken?: string;
  skipRefresh?: boolean;
};

type ApiErrorResponse = {
  message?: string;
  errors?: unknown;
};

type RefreshResponse = {
  success: boolean;
  data: {
    access: string;
  };
  message: string | null;
  errors: unknown;
};

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "Refresh Token یافت نشد.",
      );
    }

    const response = await fetch(
      `${API_URL}/auth/mobile/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      },
    );

    let data: RefreshResponse | null = null;

    try {
      data = await response.json();
    } catch {
      // Response does not contain JSON.
    }

    if (!response.ok || !data?.data?.access) {
      await clearTokens();

      throw new Error(
        data?.message ||
          "نشست شما منقضی شده است.",
      );
    }

    await setAccessToken(
      data.data.access,
    );

    return data.data.access;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions,
  accessToken?: string,
): Promise<T> {
  const {
    accessToken: optionAccessToken,
    skipRefresh,
    headers,
    ...requestOptions
  } = options;

  const token =
    accessToken ??
    optionAccessToken ??
    (await getAccessToken());

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...headers,
      },
    },
  );

  let data: T | null = null;

  try {
    data = await response.json();
  } catch {
    // Response does not contain JSON.
  }

  if (
    response.status === 401 &&
    !skipRefresh
  ) {
    try {
      const newAccessToken =
        await refreshAccessToken();

      return request<T>(
        endpoint,
        {
          ...options,
          skipRefresh: true,
        },
        newAccessToken,
      );
    } catch {
      await clearTokens();

      throw new Error(
        "نشست شما منقضی شده است.",
      );
    }
  }

  if (!response.ok) {
    const error = data as ApiErrorResponse | null;
    console.log("API ERROR STATUS:", response.status);
    console.log("API ERROR BODY:", data);

    const apiError = new Error(
      error?.message ||
        "خطایی در ارتباط با سرور رخ داد.",
    );

    Object.assign(apiError, {
      status: response.status,
      errors: error?.errors,
    });

    throw apiError;
  }

  return data as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return request<T>(
    endpoint,
    options,
  );
}