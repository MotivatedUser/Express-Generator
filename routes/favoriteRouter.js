const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { countDocuments } = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(400))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(foundFavorite => {
                if (!foundFavorite) {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            // console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
                else {
                    req.body.forEach(favToCheck => {
                        // console.log('favToCheck', favToCheck);
                        const wasFound = foundFavorite.campsites.find(savedFavorite => savedFavorite.equals(favToCheck._id));
                        if (!wasFound) {
                            foundFavorite.campsites.push(favToCheck);
                        }

                    });

                    foundFavorite.save()
                        .then(favorite => {
                            // console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(response => {
                if (response) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                }
                else {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorite to delete.');
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // console.log("in post method");
        Favorite.findOne({ user: req.user._id })
            .then(foundFavorite => {
                // console.log("found favorite", foundFavorite);
                if (!foundFavorite) {
                    Favorite.create({ user: req.user._id, campsites: req.params.campsiteId })
                        .then(favorite => {
                            // console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
                else {
                    // console.log(req.params.campsiteId)
                    const wasFound = foundFavorite.campsites.find(savedFavorite => savedFavorite.equals(req.params.campsiteId));
                    if (!wasFound) {
                        foundFavorite.campsites.push(req.params.campsiteId);
                        foundFavorite.save()
                            .then(favorite => {
                                // console.log('Favorite Udated ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    }
                    else {
                        res.end('That campsite is already in the list of favorites!');
                    }
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(foundFavorite => {
                if (foundFavorite) {
                    const campsiteFavExists = foundFavorite.campsites.indexOf(campsiteId => campsiteId.equals(req.params.campsiteId)) !== -1;
                    if (campsiteFavExists) {
                        foundFavorite.campsites = foundFavorite.campsites.filter(campsiteId => !campsiteId.equals(req.params.campsiteId));
                        foundFavorite.save()
                            .then(favorite => {
                                // console.log('Favorite Deleted ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    }
                    else {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end(`You do not have the campsite ID ${req.params.campsiteId} favorited to delete.`);
                    }
                }
                else {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have a favorites profile.');
                }
            })
            .catch(err => next(err));
    });


module.exports = favoriteRouter;

// Alt Code 

// GET: /favorites
// function getFavorites(req, res, next) {
//     Favorite.find({ user: req.user._id })
//       .populate("user")
//       .populate("campsites")
//       .exec((err, favorite) => {
//         if (err) return next(err);
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "application/json");
//         res.json(favorite);
//       });
//   }
  
//   // POST: /favorites
//   function postFavorites(req, res, next) {
//     Favorite.findOne({ user: req.user._id }, (err, favorite) => {
//       if (err) return next(err);
//       if (!favorite) {
//         Favorite.create({ user: req.user._id, campsites: req.body }, (err, favorite) => {
//           if (err) return next(err);
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "application/json");
//           res.json(favorite);
//         });
//       } else {
//         for (let i = 0; i < req.body.length; i++) {
//           if (!favorite.campsites.includes(req.body[i]._id)) {
//             favorite.campsites.push(req.body[i]._id);
//           }
//         }
//         favorite.save((err, favorite) => {
//           if (err) return next(err);
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "application/json");
//           res.json(favorite);
//         });
//       }
//     });
//   }
  
//   // DELETE: /favorites
//   function deleteFavorites(req, res, next) {
//     Favorite.findOneAndDelete({ user: req.user._id }, (err, favorite) => {
//       if (err) return next(err);
//       if (!favorite) {
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "text/plain");
//         res.end("You do not have any favorites to delete.");
//       } else {
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "application/json");
//         res.json(favorite);
//       }
//     });
//   }
  
//   // POST: /favorites/:campsiteId
//   function postFavoritesCampsiteId(req, res, next) {
//     Favorite.findOne({ user: req.user._id }, (err, favorite) => {
//       if (err) return next(err);
//       if (!favorite) {
//         Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] }, (err, favorite) => {
//           if (err) return next(err);
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "application/json");
//           res.json(favorite);
//         });
//       } else {
//         if (favorite.campsites.includes(req.params.campsiteId)) {
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "text/