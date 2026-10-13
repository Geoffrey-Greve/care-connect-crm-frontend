import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToastState {
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: ToastState = {
  successMessage: null,
  errorMessage: null,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
      state.errorMessage = null; // Success ke sath error reset karein
    },
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
      state.successMessage = null; // Error ke sath success reset karein
    },
    clearMessages: () => initialState,
  },
});

export const { setSuccessMessage, setErrorMessage, clearMessages } =
  toastSlice.actions;

export default toastSlice.reducer;
