import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export type TUser = {
  userId: string;
  role: string;
  iat: number;
  exp: number;
  permissions?: string[];
  needsPasswordChange?: boolean;
};

type TAuthState = {
  user: null | TUser;
  token: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    setPermissions: (state, action) => {
      if (state.user) {
        state.user.permissions = action.payload;
      }
    },
    requirePasswordChange: (state) => {
      if (state.user) state.user.needsPasswordChange = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, setPermissions, requirePasswordChange, logout } = authSlice.actions;

export default authSlice.reducer;

export const useCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserPermissions = (state: RootState) => state.auth.user?.permissions || [];
