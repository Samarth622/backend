import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [false, "Name is required"]
    },
    Age: {
        type: String,
        required: [false],
        default: "",
    },
    bloodGroup: {
        type: String,
        required: [false],
        default: "",
    },
    weight: {
        type: String,
        required: [false],
        default: "",
    },
    height: {
        type: String,
        required: [false],
        default: "",
    },
    gender: {
        type: String,
        required: [false, "Gender is required"],
        default: "",
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        default: "",
    },
    email: {
        type: String,
        required: [false],
        unique: true,
        default: "",
    },
    allergies: {
        type: String,
        default: "",
    },
    medicalHistory: {
        type: String,
        default: "",
    },
    password: {
        type: String, 
        required: [true, "Password is required"]
    }
}, {timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            mobile: this.mobile,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema)

