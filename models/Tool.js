const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImageSchema = require("./Image");

const toolSchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true,
	},
	brand: {
		type: String,
		required: true,
	},
	modelNo: {
		type: String,
		default: null,
	},
	category: {
		type: Array,
		required: true,
		lowercase: true,
	},
	images: [ImageSchema],
	owner: {
		type: mongoose.Types.ObjectId,
		ref: "users",
	},
	shared: {
		type: Boolean,
		default: false,
	},
	description: {
		type: String,
		default: "",
	},
	available: {
		type: Boolean,
		default: true,
	},
	location: {
		type: { type: String },
		coordinates: [Number],
	},
	requested_by: [
		{
			type: mongoose.Types.ObjectId,
			ref: "users",
			default: [],
		},
	],
	reserved_by: [
		{
			type: mongoose.Types.ObjectId,
			ref: "users",
			default: [],
		},
	],
	lent_to: [
		{
			type: mongoose.Types.ObjectId,
			ref: "users",
			default: [],
		},
	],
});

const Tool = mongoose.model("tools", toolSchema);

module.exports = Tool;
