from rest_framework import serializers
from ..services.validation import validate_answer
from ..models import Question

class AnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    value = serializers.JSONField(required=False, allow_null=True)
    time_taken = serializers.FloatField(required=False, allow_null=True, default=0.0)


class SubmitFormSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    answers = AnswerInputSerializer(many=True)



    def validate(self, data):
        form = self.context["form"]
        submitted_answers = data["answers"]

        # Get all question IDs of this form
        form_question_ids = set(
            form.questions.values_list("id", flat=True)
        )

        for ans in submitted_answers:
            question_id = ans["question_id"]
            value = ans["value"]

            # Ensure question belongs to this form
            if question_id not in form_question_ids:
                raise serializers.ValidationError(
                    f"Question {question_id} does not belong to this form."
                )

            question = Question.objects.get(id=question_id)

            # Call validation engine
            validate_answer(question, value)

        # Check required questions
        for question in form.questions.all():
            if question.required:
                found = any(
                    ans["question_id"] == question.id
                    for ans in submitted_answers
                )
                if not found:
                    raise serializers.ValidationError(
                        f"Question {question.id} is required."
                    )

        return data