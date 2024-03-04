const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const { PORT, BASE_URL } = process.env;

const readVideoData = () => {
	try {
		const videoData = fs.readFileSync("./data/videos.json");
		const parsedData = JSON.parse(videoData);
		return parsedData;
	} catch (error) {
		console.log("Failed to read video data file");
	}
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
		const videosArr = readVideoData();
		videosArr.push(newVideo);
		try {
			fs.writeFileSync("./data/videos.json", JSON.stringify(videosArr));
			console.log("Updated video data file successfully");
		} catch (error) {
			console.log("Failed to write updated video data to file");
		}
		res.status(201).json(newVideo);
	});

router.get("/:id", (req, res) => {
	let videosArr = readVideoData();
	videosArr = setVideoDataFileUrl(videosArr);
	const mainVideo = videosArr.find((video) => video.id === req.params.id);
	res.json(mainVideo);
});

router.post("/:id/comments", (req, res) => {
	const { name, comment } = req.body;
	const newComment = {
		id: uuidv4(),
		name,
		comment,
		likes: 0,
		timestamp: new Date().getTime(),
	};
	const videosArr = readVideoData();

	// add the new comment to the comments array of the video matching the video id
	videosArr
		.filter((video) => video.id === req.params.id)
		.map((video) => video.comments.push(newComment));
	try {
		fs.writeFileSync("./data/videos.json", JSON.stringify(videosArr));
		console.log("Updated video data file successfully");
	} catch (error) {
		console.log("Failed to write updated data to file");
	}
	res.status(201).json(newComment);
});

router.delete("/:videoId/comments/:commentId", (req, res) => {
	const videosArr = readVideoData();

	// find the deleted comment object to be returned
	const deletedComment = videosArr
		.find((video) => video.id === req.params.videoId)
		.comments.find((comment) => comment.id === req.params.commentId);

	// remove the deleted comment object from the comments array of the video matching the video id
	videosArr
		.filter((video) => video.id === req.params.videoId)
		.map((video) => {
			video.comments = video.comments.filter(
				(comment) => comment.id !== req.params.commentId
			);
		});
	try {
		fs.writeFileSync("./data/videos.json", JSON.stringify(videosArr));
		console.log("Updated video data file successfully");
	} catch (error) {
		console.log("Failed to write updated data to file");
	}
	console.log(deletedComment); // TODO: Delete later
	res.status(204).json(deletedComment);
});

module.exports = router;
