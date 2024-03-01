const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const readVideoData = () => {
	const videoData = fs.readFileSync("./data/videos.json");
	const parsedData = JSON.parse(videoData);
	return parsedData;
};

router
	.route("/")
	.get((req, res) => {
		const videos = readVideoData();
		const sideVideoList = [];
		videos.map((video) => {
			videoObj = {
				id: video.id,
				title: video.title,
				channel: video.channel,
				image: video.image,
			};
			sideVideoList.push(videoObj);
			return sideVideoList;
		});
		res.json(sideVideoList);
	})
	.post((req, res) => {
		const { title, channel, image, description, duration, video } = req.body;
		const newVideo = {
			id: uuidv4(),
			title,
			channel,
			image,
			description,
			views: "0",
			likes: "0",
			duration,
			video,
			timestamp: new Date().getTime(),
			comments: [],
		};
		const videos = readVideoData();
		videos.push(newVideo);
		fs.writeFileSync("./data/videos.json", JSON.stringify(videos), (error) => {
			if (error) {
				console.log("Failed to write updated data to file");
				return;
			}
			console.log("Updated file successfully");
		});
		res.status(201).json(newVideo);
	});

router.get("/:id", (req, res) => {
	const videos = readVideoData();
	const mainVideo = videos.find((video) => video.id === req.params.id);
	res.json(mainVideo);
});

module.exports = router;
