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
    async trainModel(
        trainingData,
    ) {
        const response = await this.client.post(
            "train/",
            trainingData,
        );

        return response.data;
    }
}

export default new DjangoTrainingService();