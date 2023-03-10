const express = require('express');
const bodyParser = require('body-parser');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');
const cors = require('./cors');


const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());


promotionRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Promotion.find()
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body)
    .then(promotion => {
        console.log('Promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotion');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});


promotionRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Promotion.findById(req.params.promotionId)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /promotion/${req.params.promotionId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next ) => {
   Promotion.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
   }, { new: true})
   .then(promotion => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
})
.catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next ) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = promotionRouter;


// const express = require('express');

// const promotionRouter = express.Router();

// promotionRouter.route('/')
// .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
// .get((req, res) => {
//     res.end('Will send all the promotions to you');
// })
// .post((req, res) => {
//     res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
// })
// .put((req, res) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /promotions');
// })
// .delete((req, res) => {
//     res.end('Deleting all promotions');
// });

// promotionRouter.route('/:promotionId')
// .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
// .get((req, res) => {
//     res.end(`Will send details of the campsite: ${req.params.promotionId} to you`);
// })

// .post((req, res) => {
//     res.statusCode = 403;
//     res.end(`POST operation not supported on /campsites/${req.params.promotionId}`);
// })

// .put((req, res) => {
//     res.write(`Updating the campsite: ${req.params.promotionId}\n`);
//     res.end(`Will update the campsite: ${req.body.name} with description: ${req.body.description}`);
// })

// .delete((req, res) => {
//     res.end(`Deleting campsite: ${req.params.promotionId}`);
// });

// module.exports = promotionRouter;