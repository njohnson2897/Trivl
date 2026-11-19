import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriendsList,
} from "../../controllers/friendControllers.js";

const router = express.Router();

router.post("/add", authenticateToken, sendFriendRequest);
router.post("/accept/:requestId", authenticateToken, acceptFriendRequest);
router.post("/reject/:requestId", authenticateToken, rejectFriendRequest);
router.get("/requests", authenticateToken, getFriendRequests);
router.get("/list", authenticateToken, getFriendsList);

export default router;