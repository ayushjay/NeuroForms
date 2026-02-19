
from django.contrib import admin
from django.urls import path, include
from .views import SignUpView


urlpatterns = [
    path("accounts/",include('django.contrib.auth.urls')),
    path("accounts/signup/", SignUpView.as_view(), name="signup"),
]
