import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { ApiError, ApiResponse } from '@/types/models';
import { setErrorMessage, setSuccessMessage } from './slice/toastSlice';

export const rtkQueryNotificationLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const errorResponse = action.payload as ApiError;
      const errorMessage = errorResponse?.data?.message || 'Something went wrong!';
      api.dispatch(setErrorMessage(errorMessage));
      
    } else if (isFulfilled(action)) {
      const response = action.payload as ApiResponse<unknown>;
      if (response?.status && response.message) {
        api.dispatch(setSuccessMessage(response.message));
      }
    }

    return next(action);
  };
