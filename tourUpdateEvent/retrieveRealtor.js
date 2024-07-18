const https = require("https");

const RetrieveRealtor = (location) => {
  const options = {
    hostname: "",
    path: `/api/v1/iam/?role=realtor&status=available&location=${location}`,
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(data),
        });
      });
    });

    req.on("error", (err) => {
      reject({
        statusCode: 500,
        body: "Error: " + err.message,
      });
    });

    req.end();
  });
};

module.exports = RetrieveRealtor;
