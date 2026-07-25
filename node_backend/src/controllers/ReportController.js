import ReportService from "../services/ReportService.js";

class ReportController {
    constructor() {
        this.reportService = ReportService;
    }

    // Generate report
    async generateReport(request, response, next) {
        try {
            const report = await this.reportService.generateReport(request.body);

            response.setHeader("Content-Type", report.contentType);
            response.setHeader(
                "Content-Disposition",
                `attachment; filename="${report.fileName}"`
            );

            return response.send(report.fileBuffer);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();