import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(`${API_URL}/Auth/refresh`, {
      refreshToken,
    });

    // Backend returns: { token, refreshToken, expiresAt, authDTO }
    const data = response.data;
    const newAccessToken = data.token ?? data.Token;
    const newRefreshToken = data.refreshToken ?? data.RefreshToken;
    const expiresAt = data.expiresAt ?? data.ExpiresAt;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    // Save new tokens
    localStorage.setItem("accessToken", newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    if (expiresAt) {
      localStorage.setItem("expiresAt", expiresAt);
    }

    return newAccessToken;
  } catch (error) {
    // Token refresh failed, user needs to login again
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    throw error;
  }
};
