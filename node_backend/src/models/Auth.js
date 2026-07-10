import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: "auth",
    timestamps: {
      updatedAt: "updated_at",
      createdAt: false,
    },
    versionKey: false,
  }
);

const Auth = mongoose.model("Auth", authSchema);

export default Auth;