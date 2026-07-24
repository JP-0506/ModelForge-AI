import axios from "axios";

class DjangoDeploymentService {

    constructor() {
        this.baseURL =
            process.env.DJANGO_API_URL;
    }

    // ===================================================
    // Deploy Machine Learning Model
    // ===================================================

    async deployModel(
        deploymentData,
    ) {
        try {

            const response =
                await axios.post(
                    `${this.baseURL}/deploy/`,
                    deploymentData,
                );

            return response.data;

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                "Failed to deploy model.",
            );

        }
    }
}

export default new DjangoDeploymentService();