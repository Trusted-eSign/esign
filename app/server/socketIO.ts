import * as socketIO from "socket.io";
import http from "./http";

const io = socketIO.listen(http);

export default io;
