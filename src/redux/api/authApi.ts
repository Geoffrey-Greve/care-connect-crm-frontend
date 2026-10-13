import { baseApi } from "./baseApi";
import { ApiResponse, LoginUserData } from "@/types/models";

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface SetNewPasswordRequest {
  email: string;
  password: string;
}

// Extend the base API with auth endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<ApiResponse<LoginUserData>, LoginRequest>({
      query: (credentials) => ({
        url: "/api/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),

    // Forgot Password
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/api/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // Verify OTP
    verifyOtp: builder.mutation<ApiResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: "/api/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Set New Password
    setNewPassword: builder.mutation<ApiResponse, SetNewPasswordRequest>({
      query: (data) => ({
        url: "/api/set-new-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useSetNewPasswordMutation,
} = authApi;

