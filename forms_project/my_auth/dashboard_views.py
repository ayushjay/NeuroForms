from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Form, Question, Option


@login_required
def dashboard_home(request):
    return render(request, "forms/dashboard/home.html")

@login_required
def form_list(request):
    forms = Form.objects.filter(creator=request.user)
    return render(request, "forms/dashboard/form_list.html", {"forms": forms})


@login_required
def create_form(request):
    if request.method == "POST":
        form = Form.objects.create(
            creator=request.user,
            title=request.POST.get("title"),
            description=request.POST.get("description"),
        )
        return redirect("edit_form", pk=form.id)

    return render(request, "forms/dashboard/create_form.html")


@login_required
def edit_form(request, pk):
    form = get_object_or_404(Form, pk=pk, creator=request.user)
    return render(request, "forms/dashboard/edit_form.html", {"form": form})



@login_required
def add_question(request, pk):
    form = get_object_or_404(Form, pk=pk, creator=request.user)

    if request.method == "POST":
        question = Question.objects.create(
            form=form,
            title=request.POST.get("title"),
            answer_type=request.POST.get("answer_type"),
            required=bool(request.POST.get("required")),
        )
        return render(request, "forms/dashboard/partials/question_item.html", {"question": question})
    
@login_required
def add_option(request, pk):
    question = get_object_or_404(
        Question,
        pk=pk,
        form__creator=request.user
    )

    if request.method == "POST":
        option = Option.objects.create(
            question=question,
            text=request.POST.get("text"),
            score=request.POST.get("score", 0),
        )

        return render(
            request,
            "forms/dashboard/partials/option_item.html",
            {"option": option}
        )