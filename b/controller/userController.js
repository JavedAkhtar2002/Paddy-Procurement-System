import express from "express";
import { loginUser, registerUser, getFarmers, getMillers} from "../service/userService.js"

const router=express.Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/farmers").get(getFarmers);
router.route("/millers").get(getMillers);

export {router};