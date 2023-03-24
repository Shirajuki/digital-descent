import express from "express";
const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
	console.log("Time: ", Date.now());
	next();
});

// define the home page route
router.get("/", (req, res) => {
	res.send("Hello world");
});

// define the about route
router.get("/duck", (req, res) => {
	res.send("quack quack");
});

export default router;
