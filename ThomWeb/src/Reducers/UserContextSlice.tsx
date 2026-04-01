import { createSlice } from "@reduxjs/toolkit";
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
    updateDevicePlatform: (state) => {
      state.isMobile = !state.isMobile;
    },
    updateLastLocation: (state, payload) => {
      const currLocation = payload.payload as string;
      currLocation !== PAGES.MobileHome
        ? (state.lastLocation = currLocation)
        : (state.lastLocation = PAGES.Home);
    },
  },
});

export const { updateDevicePlatform, updateLastLocation } =
  userContextSlice.actions;
export default userContextSlice.reducer;