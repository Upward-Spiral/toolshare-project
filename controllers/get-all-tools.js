// const User  = require('../models/User');
const Tool = require("../models/Tool");

function getAllHerTools(userId) {
	debugger;
	return (
		Tool.find({ owner: userId })
			// .populate('requested_by')
			.populate("lent_to")
			.then((toolList) => {
				return toolList;
			})
			.catch((err) => {
				console.log(err);
				return undefined;
			})
	);
}

module.exports = getAllHerTools;
