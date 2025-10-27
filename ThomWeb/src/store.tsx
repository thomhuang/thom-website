import {configureStore} from '@reduxjs/toolkit';

import themeReducer from './Reducers/ThemeSlice';
import userContextReducer from './Reducers/UserContextSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        userContext: userContextReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;