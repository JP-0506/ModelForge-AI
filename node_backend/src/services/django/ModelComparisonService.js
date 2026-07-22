import axios from "axios";

class ModelComparisonService {
    
    //  Initialize Django API client.

    constructor() {
        this.client = axios.create({
            baseURL: process.env.DJANGO_API_URL,
            timeout: 300000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    // ===================================================
    // Compare Machine Learning Models
    // ===================================================

    async compareModels(
        comparisonData,
    ) {
        const response = await this.client.post(
            "/compare/",
            comparisonData,
        );

        return response.data;
    }
}

export default new ModelComparisonService();