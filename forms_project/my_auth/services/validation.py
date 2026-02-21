from django.core.exceptions import ValidationError
from datetime import datetime


def validate_answer(question, value):
    answer_type = question.answer_type

    if answer_type == "paragraph":
        if not isinstance(value, str):
            raise ValidationError("Paragraph answer must be a string.")
        if question.required and value.strip() == "":
            raise ValidationError("This question cannot be empty.")

    
    elif answer_type in ["mcq", "dropdown"]:
        if not isinstance(value, int):
            raise ValidationError("Answer must be an option ID (integer).")

        if not question.options.filter(id=value).exists():
            raise ValidationError("Invalid option selected.")

  
    elif answer_type == "checkbox":
        if not isinstance(value, list):
            raise ValidationError("Checkbox answer must be a list.")

        valid_option_ids = set(
            question.options.values_list("id", flat=True)
        )

        for option_id in value:
            if option_id not in valid_option_ids:
                raise ValidationError("Invalid option in checkbox.")

   
    elif answer_type == "linear":
        if not isinstance(value, int):
            raise ValidationError("Linear scale must be integer.")

        if question.min_value is not None and question.max_value is not None:
            if not (question.min_value <= value <= question.max_value):
                raise ValidationError("Linear scale value out of range.")

    elif answer_type == "date":
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except Exception:
            raise ValidationError("Invalid date format. Use YYYY-MM-DD.")

    elif answer_type == "time":
        try:
            datetime.strptime(value, "%H:%M:%S")
        except Exception:
            raise ValidationError("Invalid time format. Use HH:MM:SS.")

    elif answer_type == "file":
        # In real system you'd validate file object
        if not value:
            raise ValidationError("File is required.")

    else:
        raise ValidationError("Unsupported question type.")