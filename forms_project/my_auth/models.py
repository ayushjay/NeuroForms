from django.db import models
from django.contrib.auth.models import User



class Form(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forms")

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    require_email = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_anonymous = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Question(models.Model):

    ANSWER_TYPES = [
        ('paragraph', 'Paragraph'),
        ('mcq', 'Multiple Choice'),
        ('checkbox', 'Checkbox'),
        ('dropdown', 'Dropdown'),
        ('file', 'File Upload'),
        ('linear', 'Linear Scale'),
        ('date', 'Date'),
        ('time', 'Time'),
    ]

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='questions')

    title = models.TextField()
    answer_type = models.CharField(max_length=20, choices=ANSWER_TYPES)

    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    # Psychology specific
    reverse_scored = models.BooleanField(default=False)
    construct = models.CharField(max_length=100, blank=True)  # e.g. Anxiety

    def __str__(self):
        return self.title
    
class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)

    # For scoring
    score = models.FloatField(default=0)

    def __str__(self):
        return self.text
    
class Response(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    email = models.EmailField(blank=True, null=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    # Store everything as JSON
    value = models.JSONField(blank=True, null=True)
    file = models.FileField(upload_to='form_uploads/', null=True, blank=True)

class Section(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)