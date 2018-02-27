import * as fs from "fs";
import * as https from "https";
import { DEFAULT_PATH } from "../constants";

const privateKey  = fs.readFileSync(DEFAULT_PATH + "/ssl/key.pem", "utf8");
const certificate = fs.readFileSync(DEFAULT_PATH +  "/ssl/cert.pem", "utf8");

const credentials = {key: privateKey, cert: certificate};

export default https.createServer(credentials).listen(4040);
