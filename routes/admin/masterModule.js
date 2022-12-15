const express = require("express");

const authorController = require("../../controllers/admin/authorController");
const publisherController = require("../../controllers/admin/publisherController");
const genreController = require("../../controllers/admin/genreController");
const bookController = require("../../controllers/admin/bookController");
const settingController = require("../../controllers/admin/settingController");
const libraryController = require("../../controllers/admin/libraryController");
const rackController = require("../../controllers/admin/rackController");
const shelfController = require("../../controllers/admin/shelfController");

const { protect } = require("../../middlewares/authMiddleware");
const { uploadAuthorProfileImage } = require("../../middlewares/fileUploadMiddleware");
const { uploadBookImage } = require("../../middlewares/fileUploadMiddleware");

const router = express.Router();

// Author master module

router.route("/storeAuthor").post(protect, uploadAuthorProfileImage, authorController.store);
router.route("/authorList").get(protect, authorController.authorList);
router.route("/authorDestroy").post(protect, authorController.authorDestroy);
router.route("/authorUpdate").post(protect, uploadAuthorProfileImage, authorController.authorUpdate);
router.route("/findAuthor/:id").get(protect, authorController.findAuthor);

// Publisher master module

router.route("/storePublisher").post(protect, publisherController.store);
router.route("/publisherList").get(protect, publisherController.publisherList);
router.route("/publisherDestroy").post(protect, publisherController.publisherDestroy);
router.route("/publisherUpdate").post(protect, publisherController.publisherUpdate);
router.route("/findPublisher/:id").get(protect, publisherController.findPublisher);

//Genre master module

router.route("/storeGenre").post(protect, genreController.store);
router.route("/genreList").get(protect, genreController.genreList);
router.route("/genreDestroy").post(protect, genreController.genreDestroy);
router.route("/genreUpdate").post(protect, genreController.genreUpdate);
router.route("/findGenre/:id").get(protect, genreController.findGenre);

//Book module

router.route("/storeBook").post(protect, uploadBookImage, bookController.store);
router.route("/bookList").get(protect, bookController.bookList);
router.route("/bookUpdate").post(protect, uploadBookImage, bookController.bookUpdate);
router.route("/storeBookStock").post(protect, bookController.storeBookStock);
router.route("/findBook/:id").get(protect, bookController.findBook);

//Setting master module

router.route("/storeSetting").post(protect, settingController.store);

//Library master module

router.route("/storeLibrary").post(protect, libraryController.store);
router.route("/libraryList").get(protect, libraryController.libraryList);

//Rack master module

router.route("/storeRack").post(protect, rackController.store);
router.route("/rackList").get(protect, rackController.rackList);

//Shelf master module

router.route("/storeShelf").post(protect, shelfController.store);
router.route("/shelfList").get(protect, shelfController.shelfList);

module.exports = router;