var config = {
	mongouri: "",
	s3key: "",
	s3secret: "",
	s3bucket: "",
}
config.s3BucketURL = "https://s3.amazonaws.com/" + config.s3bucket + "/";

module.exports = config;
