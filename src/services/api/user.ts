import { apiRequest } from "./client";

export type CurrentUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: {
    id: number;
    name: string;
  };
};

type MeResponse = {
  success: boolean;
  data: {
    user: CurrentUser;
  };
  message: string | null;
  errors: unknown;
};

export async function getMe(): Promise<CurrentUser> {
  const response = await apiRequest<MeResponse>(
    "/auth/me/",
  );

  return response.data.user;
}