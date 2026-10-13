import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "../store";
import { clearUser } from "../slice/authSlice";
import { persistor } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_PUBLIC_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("x-access-token", token);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 Unauthorized response, clear user data and redirect to login
  if (result.error && result.error.status === 401) {
    // Clear user state from Redux
    api.dispatch(clearUser());
    
    // Purge persisted state (which includes the token)
    await persistor.purge();
    
    // Clear any manual token entries from localStorage
    localStorage.removeItem("token");
    
    // Redirect to login page
    // Only redirect if we're not already on a login/auth page
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/auth/')) {
      window.location.href = '/auth/login';
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  tagTypes: [
    "Auth",
    "Profile",
    "Dashboard",
    "Clients",
    "ClientTypes",
    "ClientDocumentCategories",
    "ClientDocuments",
    "ClientGoals",
    "Languages",
    "ShiftTypes",
    "Roles",
    "Staff",
    "StaffLeaves",
    "StaffDocuments",
    "StaffDocumentCategories",
    "Teams",
    "Appointments",
    "Incidents",
    "Complaints",
    "Notifications",
    "StaffNextOfKin",
    "StaffPayrollSettings",
    "StaffNotes",
    "Strategies",
    "PublicHolidays",
    "KPIs",
    "Skills",
  ],

  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}), // Extend this in feature-specific APIs
});
