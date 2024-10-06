import axios from "axios";

const clientId = "b0047180c53e4b1fa9644caa4b0d8b7c";
const clientSecret = "a8ec5228cad34f2d8a1bece265dd59f2";
const redirectUri = "https://127.0.0.1:8000/callback";

export const getAccessToken = async (code) => {
  const tokenUrl = "https://accounts.spotify.com/api/token";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  try {
    const response = await axios.post(tokenUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};
