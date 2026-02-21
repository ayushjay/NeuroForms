from rest_framework import serializers
from ..models import Form, Question, Option


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id',
            'title',
            'answer_type',
            'required',
            'order',
            'options',
        ]


class FormSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Form
        fields = [
            'id',
            'title',
            'description',
            'require_email',
            'questions',
        ]