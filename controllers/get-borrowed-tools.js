// const User  = require('../models/User');
const Tool = require("../models/Tool");

function getAllHerBorrowedTools(userId) {
	debugger;
	return Tool.find({
		lent_to: {
			$elemMatch: { $eq: userId },
		},
	})
		.populate("owner")
		.then((toolList) => {
			return toolList;
		})
		.catch((err) => {
			console.log(err);
			return undefined;
		});
}

module.exports = getAllHerBorrowedTools;
