require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .then(() => {
    console.log("Working!");
  })
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

app.get("/", (request, response) => {
  response.render("home-page");
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artistName)
    .then((data) => {
      console.log("The received data from the API: ", data.body.artists.items);

      const allArtistData = data.body.artists.items;

      console.log(allArtistData[0].images);

      res.render("artist-search-result", { allArtistData });
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:carbonara", (req, res) => {
  spotifyApi
    .getArtistAlbums(req.params.carbonara, { limit: 1 })
    .then((data) => {
      const artistName = data.body.items[0].artists[0].name;
      res.render("album-search", { albums: data.body.items, artistName });
    });
});

app.get("/tracks/:albumId", (req, res) => {
  spotifyApi.getAlbumTracks(req.params.albumId).then((data) => {
    console.log("data:", data.body.items);
    const artistName = data.body.items[0].artists[0].name;

    res.render("tracks", { tracks: data.body.items, artistName });
  });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
