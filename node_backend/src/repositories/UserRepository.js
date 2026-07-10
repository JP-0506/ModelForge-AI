import User from "../models/User.js";
import Auth from "../models/Auth.js";

class UserRepository {
    // Get User Profile
    async getProfile(userId) {
        return await User.findOne(
            {
                _id: userId,
                is_deleted: false,
            },
            {
                __v: 0,
                is_deleted: 0,
            }
        );
    }

    // Update User Profile
    async updateProfile(userId, userData) {
        return await User.findOneAndUpdate(
            {
                _id: userId,
                is_deleted: false,
            },
            {
                ...userData,
                updated_at: new Date(),
            },
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Get Auth Record
    async getAuthByUserId(userId) {
        return await Auth.findOne({
            user_id: userId,
        });
    }

    // Update Password
    async updatePassword(userId, hashedPassword) {
        return await Auth.findOneAndUpdate(
            {
                user_id: userId,
            },
            {
                password: hashedPassword,
                updated_at: new Date(),
            },
            {
                new: true,
            }
        );
    }

    // Soft Delete User
    async deleteAccount(userId) {
        return await User.findOneAndUpdate(
            {
                _id: userId,
                is_deleted: false,
            },
            {
                is_deleted: true,
                updated_at: new Date(),
            },
            {
                new: true,
            }
        );
    }
}

export default new UserRepository();