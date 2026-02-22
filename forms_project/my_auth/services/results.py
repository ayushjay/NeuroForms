from collections import defaultdict
from ..models import Response


def calculate_results(form):
    responses = Response.objects.filter(form=form)
    total_responses = responses.count()

    construct_scores = defaultdict(list)

    for response in responses.prefetch_related("answers__question"):
        for answer in response.answers.all():
            question = answer.question

            if question.answer_type in ["mcq", "checkbox", "dropdown", "linear"]:

                value = answer.value

                if question.answer_type == "linear":
                    score = value

                elif question.answer_type in ["mcq", "dropdown"]:
                    option = question.options.filter(id=value).first()
                    score = option.score if option else 0

                elif question.answer_type == "checkbox":
                    score = 0
                    for opt_id in value:
                        option = question.options.filter(id=opt_id).first()
                        if option:
                            score += option.score

                if question.reverse_scored:
                    score = -score

                construct_scores[question.construct].append(score)

    construct_averages = {}

    for construct, scores in construct_scores.items():
        if scores:
            construct_averages[construct] = sum(scores) / len(scores)
        else:
            construct_averages[construct] = 0

    return {
        "total_responses": total_responses,
        "construct_averages": construct_averages,
    }