import { UserState } from "@/types/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  id: null,
  first_name: null,
  last_name: null,
  email: null,
  username: null,
  phone_number: null,
  profile_img: null,
  user_type: null,
  token: null,
  tempEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },

    clearUser: () => {
      return initialState;
    },

    // Store email temporarily for password reset flow
    setTempEmail: (state, action: PayloadAction<string>) => {
      state.tempEmail = action.payload;
    },

    clearTempEmail: (state) => {
      state.tempEmail = null;
    },
  },
});

export const { setUser, clearUser, setTempEmail, clearTempEmail } = authSlice.actions;
export default authSlice.reducer;
