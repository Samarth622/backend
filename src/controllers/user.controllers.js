import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

const options = {
    httpOnly: true,
    secure: false,
};

const generateAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        return { accessToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { mobile, email, name, password } = req.body;

    if (mobile === "" || name === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    if (!validateEmail(email)) {
        throw new ApiError(422, "Email is not valid");
    }

    if (password.length <= 6) {
        throw new ApiError(422, "Minimum password length is 7");
    }

    const existUsername = await User.findOne({ mobile });
    if (existUsername) {
        throw new ApiError(409, "Mobile already registered.");
    }
    const user = await User.create({
        mobile,
        email,
        name,
        password,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdUser,
                "User registered successfully!!!!"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { mobile, password } = req.body;

    if (mobile === "" && password === "") {
        throw new ApiError(400, "Mobile and Password is required");
    }

    const user = await User.findOne({ mobile });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const checkPassword = await user.isPasswordCorrect(password);

    if (!checkPassword) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken } = await generateAccessTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
            },
            "User LoggedIn successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logout successfully"));
});

const profileUser = asyncHandler(async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        // console.log(authHeader)
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized request. No token provided.");
        }

        const token = authHeader.split(" ")[1];

        // console.log(token)

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token. User not found.");
        }

        if (req.method === "GET") {

            console.log(user);
            
            return res
                .status(200)
                .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
        }

        if (req.method === "PUT") {
            const {
                Age,
                bloodGroup,
                weight,
                height,
                gender,
                mobile,
                email,
                allergies,
                medicalHistory,
            } = req.body;

            const updatedFields = {
                Age,
                weight,
                height,
                bloodGroup,
                allergies,
                medicalHistory,
                gender,
                mobile,
                email,
            };

            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                { $set: updatedFields },
                { new: true, runValidators: true }
            ).select("-password");

            console.log(updatedUser)

            return res
                .status(200)
                .json(new ApiResponse(200, { updatedUser }, "User profile updated successfully"));
        }
        throw new ApiError(405, "Method not allowed");
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        }
        throw new ApiError(400, error);
    }
});

const userName = asyncHandler(async(req, res) => {
    try {
        const authHeader = req.headers.authorization;

        // console.log(authHeader)
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized request. No token provided.");
        }

        const token = authHeader.split(" ")[1];

        // console.log(token)

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token. User not found.");
        }

        const fullName = user.name.split(" ");

        const name = fullName[0];

        console.log(name);

        return res.status(200).json(new ApiResponse(200, {name}, "Name fetch Successfully"))
    } catch (error) {
        throw new ApiError(404, "User name not found successfully")
    }
})

export { registerUser, loginUser, logoutUser, profileUser, userName };
