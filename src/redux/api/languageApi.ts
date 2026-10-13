import { baseApi } from "./baseApi";
import {
  ApiResponse,
  Language,
  CreateLanguageRequest,
  UpdateLanguageRequest,
  PaginationParams,
} from "@/types/models";

export const languageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLanguages: builder.query<ApiResponse<Language[]>, PaginationParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status.toString());
        
        return `/api/language/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Languages" as const, id })),
              { type: "Languages", id: "LIST" },
            ]
          : [{ type: "Languages", id: "LIST" }],
    }),
    getLanguageById: builder.query<ApiResponse<Language>, number>({
      query: (id) => `/api/language/${id}`,
      providesTags: (result, error, id) => [{ type: "Languages", id }],
    }),
    createLanguage: builder.mutation<ApiResponse<Language>, CreateLanguageRequest>({
      query: (newLanguage) => ({
        url: "/api/language/create",
        method: "POST",
        body: newLanguage,
      }),
      invalidatesTags: [{ type: "Languages", id: "LIST" }],
    }),
    updateLanguage: builder.mutation<ApiResponse<Language>, UpdateLanguageRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/language/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Languages", id },
        { type: "Languages", id: "LIST" },
      ],
    }),
    changeLanguageStatus: builder.mutation<ApiResponse<null>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/language/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "Languages", id: params.id },
        { type: "Languages", id: "LIST" },
      ],
    }),
    deleteLanguage: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/language/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Languages", id },
        { type: "Languages", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLanguagesQuery,
  useGetLanguageByIdQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useChangeLanguageStatusMutation,
  useDeleteLanguageMutation,
} = languageApi;
