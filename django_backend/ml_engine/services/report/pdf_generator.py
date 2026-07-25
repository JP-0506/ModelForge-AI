from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


class PDFGenerator:
    """Generic PDF Generator."""

    def __init__(self):
        self.styles = getSampleStyleSheet()

    def generate(self, title, sections):
        """
        Generate PDF.

        Parameters
        ----------
        title : str
        sections : list

        Returns
        -------
        BytesIO
        """
        self.buffer = BytesIO()
        self.document = SimpleDocTemplate(
            self.buffer,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )
        self.elements = []

        # Report title
        self.add_title(title)

        # Report sections
        for section in sections:
            self.add_heading(section.get("heading"))
            content = section.get("content")

            if isinstance(content, str):
                self.add_paragraph(content)

            elif isinstance(content, dict):
                self.add_dictionary(content)

            elif isinstance(content, list):
                if len(content) > 0 and isinstance(content[0], list):
                    self.add_table(content)
                else:
                    self.add_list(content)

            self.add_horizontal_line()
            self.add_spacer(0.25)

        # Build PDF
        self.document.build(self.elements)
        self.buffer.seek(0)

        return self.buffer

    def add_title(self, title):
        """Add the report title."""
        self.elements.append(Paragraph(f"<b>{title}</b>", self.styles["Title"]))
        self.add_spacer(0.30)

    def add_heading(self, heading):
        """Add a section heading."""
        self.elements.append(Paragraph(f"<b>{heading}</b>", self.styles["Heading2"]))
        self.add_spacer(0.10)

    def add_paragraph(self, text):
        """Add a plain text paragraph."""
        self.elements.append(Paragraph(str(text), self.styles["BodyText"]))

    def add_dictionary(self, data):
        """Render a dict as a two-column Field/Value table."""
        table_data = [["Field", "Value"]]

        for key, value in data.items():
            table_data.append([str(key), str(value)])

        self.add_table(table_data)

    def add_list(self, items):
        """Add a bulleted list."""
        for item in items:
            self.elements.append(Paragraph(f"• {item}", self.styles["BodyText"]))

    def add_table(self, table_data):
        """Add a styled table."""
        table = Table(table_data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ]
            )
        )
        self.elements.append(table)

    def add_horizontal_line(self):
        """Add a horizontal divider line."""
        self.elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))

    def add_spacer(self, height):
        """Add vertical space (height in inches)."""
        self.elements.append(Spacer(1, height * inch))
