import axios from "axios";

class DjangoPredictionService {

    constructor() {
        this.baseURL =
            process.env.DJANGO_API_URL;
    }

    // ===================================================
    // Generate Machine Learning Prediction
    // ===================================================

    async predict(
        predictionData,
    ) {
        try {

            const response =
                await axios.post(
                    `${this.baseURL}/predict/`,
                    predictionData,
                );

            return response.data;

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                "Failed to generate prediction.",
            );

        }
    }
}

export default new DjangoPredictionService();