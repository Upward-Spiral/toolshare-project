const express = require("express");
const router = express.Router();
const qs = require("qs");
const Tool = require("../models/Tool");
const uploadCloudTool = require("../config/cloudinaryTool.js");
const createTool = require("../controllers/create-tool");
const deleteTool = require("../controllers/delete-tool");
const getAllHerTools = require("../controllers/get-all-tools");
const getAllHerBorrowedTools = require("../controllers/get-borrowed-tools");
const updateTool = require("../controllers/update-tool");
const getAllRequests = require("../controllers/get-requests");
const FormReserveLine = require("../controllers/form-reserve-line");

// Search all the shared tools by name
router.post("/search", (req, res, next) => {
	debugger;
	let userId = req.session.currentUser._id;
	let searchPhrase = req.body.word;
	let searchCo = [Number(req.body.lng), Number(req.body.lat)]; // e.g. [4.8670948,52.3756701]
	console.log(searchCo);
	Tool.aggregate([
		{
			$geoNear: {
				near: {
					type: "Point",
					coordinates: searchCo,
				},
				distanceField: "distanceFrom",
				maxDistance: 200000,
				query: {
					name: new RegExp(searchPhrase),
				},
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "owner",
				foreignField: "_id",
				as: "owner",
			},
		},
	])
		.then((toolData) => {
			console.log(toolData);
			res.status(200).json(toolData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				messageBody: `Error, could not fetch because: ${err}`,
			});
		});
});

// Get the list of all her tools
router.get("/toolshed/:id", (req, res) => {
	debugger;
	let userId = req.params.id;
	getAllHerTools(userId)
		.then((toolsList) => {
			res.status(200).json(toolsList);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool list because: ${err}`,
			});
		});
});

// Get the list of all her BORROWED tools
router.get("/borrowed/:id", (req, res) => {
	debugger;
	let userId = req.params.id;
	getAllHerBorrowedTools(userId)
		.then((toolsList) => {
			res.status(200).json(toolsList);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch borrowed tool list because: ${err}`,
			});
		});
});

// Get the list of all the requests
router.get("/requests", (req, res) => {
	debugger;
	let userId = req.session.currentUser._id;
	getAllRequests(userId)
		.then((toolsList) => {
			if (toolsList) {
				res.status(200).json(toolsList);
			} else {
				res.status(204).json({
					messageBody:
						"for some reason, no toollist was returned. Check the server console for error",
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool list because: ${err}`,
			});
		});
});

// Get all info on one tool
router.get("/detail/:id", (req, res) => {
	debugger;
	let toolId = req.params.id;
	Tool.findById(toolId)
		.populate("owner")
		.populate("lent_to")
		.then((toolData) => {
			res.status(200).json({ toolData });
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool detail because: ${err}`,
			});
		});
});

// Create a new tool
router.post("/create", (req, res) => {
	debugger;
	let userId = req.session.currentUser._id;
	createTool(userId, req.body)
		.then((response) => {
			let { status, messageBody, data } = response;
			if (status === 200) {
				res.status(200).json(data);
			} else {
				res.status(500).json({
					messageBody: messageBody,
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, tool not created because: ${err}`,
			});
		});
	// }
});

// Update a tool (not image)
router.post("/update", (req, res) => {
	debugger;
	let toolId = req.body.id;
	updateTool(toolId, req.body)
		.then((response) => {
			let { status, messageBody, data } = response;
			if (status === 200) {
				res.status(200).json(data);
			} else {
				res.status(500).json({
					messageBody: messageBody,
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, tool not created because: ${err}`,
			});
		});
});

// Update a tool's image
router.post("/update-img", (req, res) => {
	debugger;
	let { newImg, toolId } = qs.parse(req.body);
	Tool.findById(toolId)
		.then((toolData) => {
			if (toolData.images) toolData.images.push(newImg);
			toolData
				.save()
				.populate("owner")
				.then((toolData) => {
					console.log(toolData);
					res.status(200).json(toolData);
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, from outer catch in route because: ${err}`,
				data: null,
			});
		});
});

// Upload images for a tool
router.post("/upload-image", uploadCloudTool.single("tool-img"), (req, res) => {
	debugger;
	const imgPath = req.file.url;
	const imgName = req.file.originalname;
	var newImage = { imgName: imgName, imgPath: imgPath };
	console.log(newImage);
	res.status(200).json(newImage);
});

// Share a tool
router.get("/share/:id", (req, res) => {
	debugger;
	let toolId = req.params.id;
	Tool.findByIdAndUpdate(
		toolId,
		{
			shared: true,
		},
		{ new: true }
	)
		.populate("owner")
		.then((toolData) => {
			console.log(toolData);
			res.status(200).json(toolData);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool detail because: ${err}`,
			});
		});
});

// Unshare a tool
router.get("/unshare/:id", (req, res) => {
	debugger;
	let toolId = req.params.id;
	Tool.findByIdAndUpdate(
		toolId,
		{
			shared: false,
		},
		{ new: true }
	)
		.populate("owner")
		.then((toolData) => {
			console.log(toolData);
			res.status(200).json(toolData);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool detail because: ${err}`,
			});
		});
});

// Borrow a tool
router.get("/borrow/:id", (req, res) => {
	// not finished
	debugger;
	let userId = req.session.currentUser._id;
	let toolId = req.params.id;
	Tool.findByIdAndUpdate(
		toolId,
		{
			$push: {
				requested_by: userId,
			},
			new_reqs: true,
		},
		{ new: true }
	)
		.populate("owner")
		.then((toolData) => {
			console.log(toolData);
			res.status(200).json(toolData);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool detail because: ${err}`,
			});
		});
});

// Withdraw request to Borrow a tool
router.get("/unborrow/:id", (req, res) => {
	// not finished
	debugger;
	let userId = req.session.currentUser._id;
	let toolId = req.params.id;
	Tool.findById(toolId)
		.then((toolData) => {
			toolData.requested_by.splice(toolData.requested_by.indexOf(userId), 1);
			toolData
				.save()
				.populate("owner")
				.then((toolData) => {
					console.log(toolData);
					res.status(200).json(toolData);
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, from outer catch in route because: ${err}`,
				data: null,
			});
		});
});

// Withdraw request to reserve a tool
router.get("/unreserve/:id", (req, res) => {
	// not finished
	debugger;
	let userId = req.session.currentUser._id;
	let toolId = req.params.id;
	Tool.findById(toolId)
		.then((toolData) => {
			toolData.reserved_by.splice(toolData.reserved_by.indexOf(userId), 1);
			toolData
				.save()
				.populate("owner")
				.then((toolData) => {
					console.log(toolData);
					res.status(200).json(toolData);
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, from outer catch in route because: ${err}`,
				data: null,
			});
		});
});

// Reserve a tool
router.get("/reserve/:id", (req, res) => {
	// not finished!
	debugger;
	let toolId = req.params.id;
	Tool.findByIdAndUpdate(
		toolId,
		{
			$push: {
				reserved_by: userId,
			},
		},
		{ new: true }
	)
		.populate("owner")
		.then((toolData) => {
			console.log(toolData);
			res.status(200).json(toolData);
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not fetch tool detail because: ${err}`,
			});
		});
});

// Lend tool
router.post("/lend", (req, res) => {
	// not finished!
	debugger;
	let toolId = req.body.toolId;
	var requesterId = req.body.requesterId;
	Tool.findByIdAndUpdate(
		toolId,
		{
			$set: {
				lent_to: [requesterId],
				available: false,
			},
		},
		{ new: true }
	)
		.then((toolData) => {
			// removes the requester from the requester list
			toolData.requested_by.splice(
				toolData.requested_by.indexOf(requesterId),
				1
			);
			toolData
				.save()
				.then((response) => {
					console.log(response);
					// moves all the other requesters to the reservers list
					FormReserveLine(response._id, response.requested_by)
						.then((listData) => {
							if (listData) {
								res.status(200).json(listData);
							} else {
								res
									.status(500)
									.json({
										messageBody:
											"error in the controller while forming reserved list",
									});
							}
						})
						.catch((err) => {
							console.log("error in forming reserved list", err);
							res
								.status(500)
								.json({ messageBody: "error in forming reserved list" });
						});
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json({
						messageBody: `Error, could not complete lending the tool because: ${err}`,
					});
				});
		})
		.catch((err) => {
			res.status(500).json({
				messageBody: `Error, could not lend the tool because: ${err}`,
			});
		});
});

// Delete a tool
router.get("/delete/:id", (req, res) => {
	debugger;
	let toolId = req.params.id;
	deleteTool(toolId)
		.then((response) => {
			res.status(response.status).json({
				messageBody: response.messageBody,
			});
			console.log(response);
		})
		.catch((err) => {
			console.log(`Error, user deleted because: ${err}`);
		});
});

module.exports = router;
