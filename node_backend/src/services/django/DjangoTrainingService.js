import axios from "axios";

class DjangoTrainingService {
    /**
     * Initialize Django API client.
     */
    constructor() {
        console.log("DJANGO_API_URL =", process.env.DJANGO_API_URL);
        this.client = axios.create({
            baseURL: process.env.DJANGO_API_URL,
            timeout: 300000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Train a Machine Learning model.
     */
    // async trainModel(
    //     trainingData,
    // ) {
    //     const response = await this.client.post(
    //         "train/",
    //         trainingData,
    //     );

    //     return response.data;
    // }
    async trainModel(
        trainingData,
    ) {
        try {

            const response = await this.client.post(
                "train/",
                trainingData,
            );

            return response.data;

        }
        catch (error) {

            // Django returned a response (400, 404, 500, ...)
            if (error.response) {
                return error.response.data;
            }

            // Network error / Django server down
            throw new Error(
                error.message,
            );
        }
    }
}

export default new DjangoTrainingService();