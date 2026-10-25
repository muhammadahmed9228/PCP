// backend/src/modules/auth/auth.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { Team } from "../teams/team.model.js";
import jwt from "jsonwebtoken";

export const registerUCI = asyncHandler(async (req, res) => {
  const {
    uciNo, uciName, username, password, phoneNumber, 
    gender, isGovtEmployee, ucNumber, ucName, 
    province, district, townTehsil
  } = req.body;

  // Basic validation - can be expanded with Zod middleware if preferred
  if (
    [uciNo, uciName, username, password, phoneNumber, gender, ucNumber, ucName, province, district, townTehsil].some(
      (field) => typeof field === "string" && field.trim() === ""
    ) || isGovtEmployee === undefined
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Prevent duplicate UCI registration
  const existingUCI = await UCI.findOne({ username });
  if (existingUCI) {
    throw new ApiError(409, "UCI with this CNIC already exists");
  }

  const uci = await UCI.create({
    uciNo, uciName, username, password, phoneNumber, 
    gender, isGovtEmployee, ucNumber, ucName, 
    province, district, townTehsil
  });

  const createdUCI = await UCI.findById(uci._id).select("-password -refreshToken");

  if (!createdUCI) {
    throw new ApiError(500, "Something went wrong while registering the UCI");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUCI, "UCI registered successfully")
  );
});

// Utility to generate both tokens and save the refresh token to the database
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await UCI.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export const loginUCI = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    const user = await UCI.findOne({ username });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await UCI.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "UCI logged in successfully"
            )
        );
});

export const logoutUCI = asyncHandler(async (req, res) => {
    // Proper logout/token invalidation strategy
    await UCI.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "UCI logged out successfully"));
});


// Utility for AIC token generation
const generateAicAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await AIC.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export const loginAIC = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    const user = await AIC.findOne({ username });
    if (!user) {
        throw new ApiError(404, "AIC does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAicAccessAndRefreshTokens(user._id);

    const loggedInUser = await AIC.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "AIC logged in successfully"
            )
        );
});

export const logoutAIC = asyncHandler(async (req, res) => {
    // Proper logout/token invalidation strategy for AIC
    await AIC.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "AIC logged out successfully"));
});


const generateTeamAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await Team.findById(userId);
        const accessToken = jwt.sign({ _id: user._id, role: "FieldTeam" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export const loginTeam = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) throw new ApiError(400, "CNIC and password are required");

    const user = await Team.findOne({ username });
    if (!user) throw new ApiError(404, "Team not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateTeamAccessAndRefreshTokens(user._id);
    const loggedInUser = await Team.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Team logged in successfully"));
});

export const logoutTeam = asyncHandler(async (req, res) => {
    await Team.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Team logged out successfully"));
});