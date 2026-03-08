from django.urls import path

from . import api_views
from . import dashboard_views
from . import views
from .views import login_view, logout_view, signup_view, home_view

urlpatterns = [
    # API routes used by the React frontend
    path("api/csrf/", api_views.csrf_token),
    path("api/me/", api_views.me),
    path("api/login/", api_views.api_login),
    path("api/signup/", api_views.api_signup),
    path("api/logout/", api_views.api_logout),
    path("api/dashboard/", api_views.api_dashboard),
    path("api/dashboard/forms/", api_views.api_form_list),
    path("api/dashboard/forms/create/", api_views.api_create_form),
    path("api/dashboard/forms/<int:pk>/edit/", api_views.api_edit_form),
    path("api/dashboard/forms/<int:pk>/delete/", api_views.api_delete_form),
    path("api/dashboard/forms/<int:pk>/questions/add/", api_views.api_add_question),
    path("api/dashboard/questions/<int:pk>/options/add/", api_views.api_add_option),
    path("api/forms/<int:pk>/", api_views.api_form_detail),
    path("api/forms/<int:pk>/submit/", api_views.api_submit_form),
    path("api/forms/<int:pk>/results/", api_views.api_form_results),

    # Existing server-rendered pages
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
