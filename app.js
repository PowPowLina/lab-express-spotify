require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');


// require spotify-web-api-node package here:
const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));


// Our routes go here:
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/artist-search', (req, res) => {

    spotifyApi
        .searchArtists(req.query.artist)
        .then(data => {
            const spotifyArray = data.body.artists.items;
            // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
            const artistArray = spotifyArray.map(function (element) {
                return {
                    name: element.name,
                    image: element.images[0],
                    id: element.id
                };
            });
            res.render('artist-search-results', { artistArray });
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:artistId', (req, res, next) => {

    spotifyApi.getArtistAlbums(
        req.params.artistId, {
            limit: 10,
            offset: 20
        },
        
        function (err, data) {
            
            if (err) {
                console.error('Something went wrong!', err);
            } else {
                const spotifyAlbumsArray = data.body.items;

                const albumsArray = spotifyAlbumsArray.map(function (album) {
                    return {
                        name: album.name,
                        image: album.images[0],
                        id: album.id
                    };
                });
               
                res.render('albums', { albumsArray });
            }
            
        }
    );    
});


app.get('/tracks/:albumId', (req, res) => {

    spotifyApi.getAlbumTracks(
        req.params.albumId, { 
            limit : 5, 
            offset : 1 
        })
    .then(function(data) {
      const spotifyTracksArray = data.body.items;
   
      const tracksArray = spotifyTracksArray.map(function (track) {
          return {
              name: track.name,
              audio: track.preview_url,
              id: track.id
          };
      });
   
      res.render('tracks', { tracksArray});

    }, function(err) {
      console.log('Something went wrong!', err);
    });

});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));