const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const videoRoutes = require("./routes/videos");

require("dotenv").config();
const { PORT, API_KEY } = process.env;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// check that a valid API key is provided with the api request
app.use((req, res, next) => {
	if (req.query.api_key !== API_KEY) {
		return res.status(401).send("You must provide a valid API key");
	}
	next();
});

app.use("/videos", videoRoutes);

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
