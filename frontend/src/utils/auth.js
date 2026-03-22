// This file strictly manages the single-tab session state.
const TOKEN_KEY = 'agent_access_token';

export const setToken = (token) => {
    // sessionStorage ensures the token dies when the tab is closed
    sessionStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return sessionStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
    return !!getToken();
};