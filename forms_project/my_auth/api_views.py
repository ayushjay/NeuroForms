from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response as DRFResponse

from .models import Form, Question, Option, Response, Answer
from .serializers.submission_serializers import SubmitFormSerializer
from .services.results import calculate_results


def user_json(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    return DRFResponse({"csrfToken": get_token(request)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return DRFResponse(user_json(request.user))


@api_view(["POST"])
@permission_classes([AllowAny])
def api_login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return DRFResponse({"error": "Invalid email or password"}, status=400)

    user = authenticate(request, username=user_obj.username, password=password)
    if user:
        login(request, user)
        if not request.data.get("remember_me"):
            request.session.set_expiry(0)
        return DRFResponse({"user": user_json(user)})

    return DRFResponse({"error": "Invalid email or password"}, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def api_signup(request):
    d = request.data
    if User.objects.filter(email=d.get("email")).exists():
        return DRFResponse({"email": ["Already in use"]}, status=400)
    if User.objects.filter(username=d.get("username")).exists():
        return DRFResponse({"username": ["Already taken"]}, status=400)

    User.objects.create_user(
        username=d["username"],
        email=d["email"],
        password=d["password"],
        first_name=d.get("first_name", ""),
        last_name=d.get("last_name", ""),
    )
    return DRFResponse({"message": "Account created"}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    return DRFResponse(status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_dashboard(request):
    forms = Form.objects.filter(creator=request.user)
    return DRFResponse(
        {
            "total_forms": forms.count(),
            "total_responses": sum(f.response_set.count() for f in forms),
            "active_forms": forms.filter(is_active=True).count(),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_form_list(request):
    forms = Form.objects.filter(creator=request.user).order_by("-created_at")
    return DRFResponse(
        [
            {
                "id": f.id,
                "title": f.title,
                "description": f.description,
                "is_active": f.is_active,
                "created_at": str(f.created_at.date()),
                "response_count": f.response_set.count(),
            }
            for f in forms
        ]
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_create_form(request):
    form = Form.objects.create(
        creator=request.user,
        title=request.data["title"],
        description=request.data.get("description", ""),
    )
    return DRFResponse({"id": form.id}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_edit_form(request, pk):
    form = Form.objects.prefetch_related("questions__options").get(
        pk=pk, creator=request.user
    )
    return DRFResponse(
        {
            "id": form.id,
            "title": form.title,
            "description": form.description,
            "require_email": form.require_email,
            "is_active": form.is_active,
            "is_anonymous": form.is_anonymous,
            "created_at": str(form.created_at),
            "updated_at": str(form.updated_at),
            "questions": [
                {
                    "id": q.id,
                    "title": q.title,
                    "answer_type": q.answer_type,
                    "required": q.required,
                    "order": q.order,
                    "reverse_scored": q.reverse_scored,
                    "construct": q.construct,
                    "options": [
                        {"id": o.id, "text": o.text, "score": o.score}
                        for o in q.options.all()
                    ],
                }
                for q in form.questions.all().order_by("order")
            ],
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def api_delete_form(request, pk):
    Form.objects.filter(pk=pk, creator=request.user).delete()
    return DRFResponse(status=204)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_add_question(request, pk):
    form = Form.objects.get(pk=pk, creator=request.user)
    q = Question.objects.create(
        form=form,
        title=request.data["title"],
        answer_type=request.data["answer_type"],
        required=request.data.get("required", False),
        order=form.questions.count(),
    )
    return DRFResponse(
        {
            "id": q.id,
            "title": q.title,
            "answer_type": q.answer_type,
            "required": q.required,
            "order": q.order,
            "options": [],
        },
        status=201,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_add_option(request, pk):
    question = Question.objects.get(pk=pk, form__creator=request.user)
    o = Option.objects.create(
        question=question,
        text=request.data["text"],
        score=request.data.get("score", 0),
    )
    return DRFResponse({"id": o.id, "text": o.text, "score": o.score}, status=201)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_form_detail(request, pk):
    form = get_object_or_404(Form.objects.prefetch_related("questions__options"), pk=pk)
    if not form.is_active:
        return DRFResponse({"error": "Form not found"}, status=404)

    return DRFResponse(
        {
            "id": form.id,
            "title": form.title,
            "description": form.description,
            "require_email": form.require_email,
            "questions": [
                {
                    "id": q.id,
                    "title": q.title,
                    "answer_type": q.answer_type,
                    "required": q.required,
                    "order": q.order,
                    "options": [
                        {"id": o.id, "text": o.text, "score": o.score}
                        for o in q.options.all()
                    ],
                }
                for q in form.questions.all().order_by("order")
            ],
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def api_submit_form(request, pk):
    form = get_object_or_404(Form, pk=pk)
    serializer = SubmitFormSerializer(data=request.data, context={"form": form})
    serializer.is_valid(raise_exception=True)

    response_obj = Response.objects.create(
        form=form,
        email=serializer.validated_data.get("email"),
    )

    for ans in serializer.validated_data["answers"]:
        question = Question.objects.get(id=ans["question_id"])
        Answer.objects.create(
            response=response_obj,
            question=question,
            value=ans["value"],
        )

    return DRFResponse({"message": "Form submitted successfully"}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_form_results(request, pk):
    form = get_object_or_404(Form, pk=pk, creator=request.user)
    return DRFResponse(calculate_results(form))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_shorten_url(request, pk):
    form = get_object_or_404(Form, pk=pk, creator=request.user)
    from .models import ShortLink
    short_link, created = ShortLink.objects.get_or_create(form=form)
    return DRFResponse({"short_code": short_link.short_code})

