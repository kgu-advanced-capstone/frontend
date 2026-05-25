import { useQuery } from "@tanstack/react-query";
import type { HrUsersParams, HrUsersResponse } from "./types";
import { customInstance } from "./mutator/custom-instance";

type HrUsersApiResponse = {
  data: HrUsersResponse;
  status: 200;
  headers: Headers;
};

export const getHrUsersQueryKey = (params?: HrUsersParams) =>
  ["/api/hr/users", params] as const;

const getHrUsers = async (params?: HrUsersParams): Promise<HrUsersResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.certifications) searchParams.set("certifications", params.certifications);
  if (params?.skills) searchParams.set("skills", params.skills);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));

  const qs = searchParams.toString();
  const url = `/api/hr/users${qs ? `?${qs}` : ""}`;
  const res = await customInstance<HrUsersApiResponse>(url, { method: "GET" });
  return res.data;
};

export const useGetHrUsers = (params?: HrUsersParams) =>
  useQuery({
    queryKey: getHrUsersQueryKey(params),
    queryFn: () => getHrUsers(params),
  });
