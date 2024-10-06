import React, { useState, useEffect } from "react";
import axios from "axios";
import SongList from "./SongList";
import { getAccessToken } from "../api";

// const CLIENT_ID = "b0047180c53e4b1fa9644caa4b0d8b7c"
// const REDIRECT_URI = "https://127.0.0.1:8000/callback"
// const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
// const RESPONSE_TYPE = "token"

const clientId = "b0047180c53e4b1fa9644caa4b0d8b7c"; // Add your Spotify client ID here
const redirectUri = "https://127.0.0.1:8000/callback"; // Ensure this matches your Spotify app settings

const MusicPlayer = () => {
  const [genre, setGenre] = useState("");
  const [artist, setArtist] = useState("");
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const getTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        getAccessToken(code)
          .then((token) => {
            setAccessToken(token);
            window.history.pushState({}, document.title, "/"); // Clear code from URL
          })
          .catch((err) => console.error(err));
      }
    };
    getTokenFromUrl();
  }, []);

  useEffect(() => {
    if (accessToken) {
      // Fetch user info after getting the access token
      axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setUserInfo(response.data);
        })
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, [accessToken]);

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  const handleArtistChange = (e) => {
    setArtist(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = `genre:${genre} artist:${artist}`;

    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: "track",
          limit: 10,
        },
      });
      setSongs(response.data.tracks.items);
      setCurrentSongIndex(0);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error fetching songs from Spotify:", error);
    }
  };

  useEffect(() => {
    if (isPlaying && songs.length > 0) {
      const timer = setInterval(() => {
        setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
      }, 15000); // Change song every 15 seconds

      return () => clearInterval(timer); // Cleanup interval on unmount
    }
  }, [isPlaying, songs]);

  return (
    <div>
      {!accessToken ? (
        <a
          href={`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
            redirectUri
          )}&scope=user-read-private%20user-read-email%20user-top-read`}
        >
          Login with Spotify
        </a>
      ) : (
        <div>
          {userInfo && (
            <div>
              <h2>Welcome, {userInfo.display_name}!</h2>
              <p>Email: {userInfo.email}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Genre"
              value={genre}
              onChange={handleGenreChange}
              required
            />
            <input
              type="text"
              placeholder="Enter Artist"
              value={artist}
              onChange={handleArtistChange}
              required
            />
            <button type="submit">Get Songs</button>
          </form>
          {isPlaying && songs.length > 0 && (
            <div>
              <h2>Now Playing: {songs[currentSongIndex]?.name}</h2>
              <audio controls autoPlay>
                <source
                  src={songs[currentSongIndex]?.preview_url}
                  type="audio/mpeg"
                />
                Your browser does not support the audio tag.
              </audio>
              <SongList songs={songs} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
