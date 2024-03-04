const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const { PORT, BASE_URL } = process.env;

const readVideoData = () => {
	const videoData = fs.readFileSync("./data/videos.json");
	const parsedData = JSON.parse(videoData);
	return parsedData;
};

const setVideoDataFileUrl = (array) => {
	array.forEach((element) => {
		element.image = `${BASE_URL}:${PORT}${element.image}`;
		element.video = `${BASE_URL}:${PORT}${element.video}`;
	});
	return array;
};

router
	.route("/")
	.get((req, res) => {
		let videosArr = readVideoData();
		videosArr = setVideoDataFileUrl(videosArr);
		const sideVideoList = [];
		videosArr.map((video) => {
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
	let videosArr = readVideoData();
	videosArr = setVideoDataFileUrl(videosArr);
	const mainVideo = videosArr.find((video) => video.id === req.params.id);
	res.json(mainVideo);
});

module.exports = router;
