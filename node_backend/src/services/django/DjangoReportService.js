import axios from "axios";

class DjangoReportService {
  constructor() {
    this.baseURL = process.env.DJANGO_API_URL;
  }

  // Generate report
  async generateReport(reportData) {
    try {
      const response = await axios.post(`${this.baseURL}/report/`, reportData, {
        responseType: "arraybuffer",
      });

      return {
        fileBuffer: response.data,
        contentType: response.headers["content-type"],
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to generate report."
      );
    }
  }
}

export default new DjangoReportService();