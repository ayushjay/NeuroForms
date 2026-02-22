from django.urls import path
from .views import signup_view, login_view, logout_view, home_view
from django.urls import path
from .views import FormDetailView, SubmitFormView
from . import views
from . import dashboard_views


urlpatterns = [
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("", home_view, name="home"),
    path("forms/<int:pk>/", views.render_form, name="render_form"),
    path("forms/<int:pk>/submit/", views.submit_form, name="submit_form"),
    path("forms/<int:pk>/results/", views.results_view, name="results_view"),
    path("forms/<int:pk>/results/data/", views.results_partial, name="results_partial"),
    path("dashboard/", dashboard_views.dashboard_home, name="dashboard_home"),
    path("dashboard/forms/", dashboard_views.form_list, name="form_list"),
    path("dashboard/forms/create/", dashboard_views.create_form, name="create_form"),
    path("dashboard/forms/<int:pk>/edit/", dashboard_views.edit_form, name="edit_form"),
    path("dashboard/forms/<int:pk>/questions/add/", dashboard_views.add_question, name="add_question"),
    path("dashboard/questions/<int:pk>/options/add/", dashboard_views.add_option, name="add_option"),
]
