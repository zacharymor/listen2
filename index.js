const express = require('express');
const session = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const PORT = process.env.PORT || 3000;

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI || 'http://listen2.app/callback'
});

// Express session setup
app.use(session({
  secret: 'some-random-string',
  resave: false,
  saveUninitialized: true
}));

// Endpoints
app.get('/login', (req, res) => {
  const scopes = ['playlist-modify-public'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect('/create-playlist');
  } catch(err) {
    res.send(err);
  }
});

app.get('/create-playlist', async (req, res) => {
  try {
    const result = await spotifyApi.createPlaylist('My New Playlist', { 'description': 'Created with Node.js', 'public': true });
    res.send(`Playlist created! Check it out: ${result.body.external_urls.spotify}`);
  } catch(err) {
    res.send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
