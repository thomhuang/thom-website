import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PAGES, ToPage } from "../Assets/Common";

interface UserContextState {
  isMobile: boolean;
  lastLocation: string;
}

const initialState: UserContextState = {
  isMobile: true,
  lastLocation: ToPage(PAGES.Home),
};

const userContextSlice = createSlice({
  name: "userContext",
  initialState,
  reducers: {
    updateDevicePlatform: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    updateLastLocation: (state, action: PayloadAction<string>) => {
      const currLocation = action.payload;
      currLocation !== PAGES.MobileHome
        ? (state.lastLocation = currLocation)
        : (state.lastLocation = PAGES.Home);
    },
  },
});

export const { updateDevicePlatform, updateLastLocation } =
  userContextSlice.actions;
export default userContextSlice.reducer;
