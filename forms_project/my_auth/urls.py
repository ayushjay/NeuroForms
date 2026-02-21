from django.urls import path
from .views import signup_view, login_view, logout_view, home_view
from django.urls import path
from .views import FormDetailView, SubmitFormView

urlpatterns = [
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("", home_view, name="home"),
    path("forms/<int:pk>/", FormDetailView.as_view()),
    path("forms/<int:pk>/submit/", SubmitFormView.as_view()),

]