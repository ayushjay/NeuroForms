from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm, LoginForm
from rest_framework.generics import RetrieveAPIView
from .models import Form
from .serializers.form_serializers import FormSerializer
from rest_framework.views import APIView
from rest_framework.response import Response as DRFResponse
from rest_framework import status
from .models import Form, Response, Answer, Question
from .serializers.submission_serializers import SubmitFormSerializer

def signup_view(request):
    form = SignUpForm()

    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')

    return render(request, "registration/signup.html", {"form": form})

def login_view(request):
    form = LoginForm()

    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            remember_me = form.cleaned_data['remember_me']

            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                form.add_error(None, "Invalid email or password")
                return render(request, "registration/login.html", {"form": form})

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                if not remember_me:
                    request.session.set_expiry(0)

                return redirect('home')
            else:
                form.add_error(None, "Invalid email or password")

    return render(request, "registration/login.html", {"form": form})



def logout_view(request):
    logout(request)
    return redirect('login')



@login_required
def home_view(request):
    return render(request, "home.html")




class FormDetailView(RetrieveAPIView):
    queryset = Form.objects.prefetch_related(
        'questions__options'
    )
    serializer_class = FormSerializer





class SubmitFormView(APIView):

    def post(self, request, pk):
        try:
            form = Form.objects.get(pk=pk)
        except Form.DoesNotExist:
            return DRFResponse(
                {"error": "Form not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SubmitFormSerializer(
            data=request.data,
            context={'form': form}
        )

        serializer.is_valid(raise_exception=True)

        # Create Response object
        response_obj = Response.objects.create(
            form=form,
            email=serializer.validated_data.get('email')
        )

        # Save answers
        for ans in serializer.validated_data['answers']:
            question = Question.objects.get(id=ans['question_id'])

            Answer.objects.create(
                response=response_obj,
                question=question,
                value=ans['value']
            )

        return DRFResponse(
            {"message": "Form submitted successfully"},
            status=status.HTTP_201_CREATED
        )