const Tool = require("../models/Tool");

function getAllRequests(userId) {
	debugger;
	return Tool.find({
		$and: [
			{ owner: userId },
			{ $or: [{ requested_by: { $ne: [] } }, { reserved_by: { $ne: [] } }] },
		],
	})
		.populate("requested_by")
		.populate("reserved_by")
		.populate("lent_to")
		.then((toolList) => {
			return toolList;
		})
		.catch((err) => {
			console.log(err);
			return undefined;
		});
}

module.exports = getAllRequests;
