import express from "express";

const server = express();

server.use(express.static("./public"));

server.listen(3000, (err) => console.log("Server running"));
