import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    darkMode: (localStorage.getItem('darkMode') || 'true') === 'true',
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme : (state) => {
            state.darkMode = !state.darkMode
            localStorage.setItem('darkMode', String(state.darkMode));
        }
    }
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;