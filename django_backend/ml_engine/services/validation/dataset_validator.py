from .file_validation import FileValidation


class DatasetValidator:
    """
    Validates uploaded datasets before processing.
    """

    def __init__(self):
        self.file_validation = FileValidation()

    def validate(self, file):
        self.file_validation.validate_empty_file(file)
        self.file_validation.validate_extension(file)
        self.file_validation.validate_file_size(file)

        return True