const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

require("dotenv").config();
const { PORT, BASE_URL } = process.env;

const multer = require("multer");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/images");
	},
	filename: (req, file, cb) => {
		cb(null, `image${Date.now()}${path.extname(file.originalname)}`);
	},
});
const upload = multer({ storage: storage });

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
	.post(upload.single("file"), (req, res) => {
		const { title, description, channel, duration, image, video } = req.body;
		const file = req.file;

		// default placeholder image is shown if the user does not upload one
		const imageUrl = file ? `/images/${file.filename}` : image;

		const newVideo = {
			id: uuidv4(),
			title,
			channel,
			image: imageUrl,
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
	res.status(204).json(deletedComment);
});

router.put("/:videoId/likes", (req, res) => {
	let videosArr = readVideoData();
	videosArr
		.filter((video) => video.id === req.params.videoId)
		.map((video) => {
			let videoLikes = video.likes.split(",").join(""); // remove comma thousand separators from number in string format
			videoLikes = Number(videoLikes) + 1; // convert to number format and increment
			video.likes = videoLikes.toLocaleString(); // convert back to string format with comma thousand separators
		});
	try {
		fs.writeFileSync("./data/videos.json", JSON.stringify(videosArr));
		console.log("Updated video data file successfully");
	} catch (error) {
		console.log("Failed to write updated data to file");
	}
	videosArr = setVideoDataFileUrl(videosArr);
	const currentVideo = videosArr.find(
		(video) => video.id === req.params.videoId
	);
	res.status(200).json(currentVideo);
});

module.exports = router;
