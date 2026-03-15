from collections import defaultdict
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from ..models import Response, Question
import math

def pearson_correlation(x, y):
    n = len(x)
    if n < 2: return 0.0
    sum_x = sum(x)
    sum_y = sum(y)
    sum_x_sq = sum(xi*xi for xi in x)
    sum_y_sq = sum(yi*yi for yi in y)
    p_sum = sum(xi*yi for xi, yi in zip(x, y))
    
    num = p_sum - (sum_x * sum_y / n)
    den = math.sqrt((sum_x_sq - sum_x**2 / n) * (sum_y_sq - sum_y**2 / n))
    if den == 0: return 0.0
    return round(num / den, 2)

def calculate_percentile(score, all_scores):
    if not all_scores: return 0
    below = sum(1 for s in all_scores if s < score)
    return round((below / len(all_scores)) * 100)

def calculate_results(form):
    # 1. Timeline of responses
    timeline_query = Response.objects.filter(form=form) \
        .annotate(date=TruncDate('submitted_at')) \
        .values('date') \
        .annotate(count=Count('id')) \
        .order_by('date')
        
    timeline = [
        {"date": item["date"].strftime("%Y-%m-%d"), "count": item["count"]}
        for item in timeline_query
    ]

    responses = Response.objects.filter(form=form)
    total_responses = responses.count()

    # construct_scores will hold a list of total scores for EACH response per construct
    # We need to calculate the score per response first.
    
    # Structure: response_construct_scores[response_id][construct] = score
    response_construct_scores = defaultdict(lambda: defaultdict(float))
    
    # Structure: question_stats[question_id] = { "text": question_title, "type": type, "options": { option_id: count } }
    question_stats = {}

    # We will also pull out non-construct answers to associate demographics with users
    user_demographics = defaultdict(dict)

    for response in responses.prefetch_related("answers__question"):
        for answer in response.answers.all():
            question = answer.question
            value = answer.value
            
            # Save demographic info (e.g. non-construct questions like Age, Gender)
            if not question.construct and question.answer_type in ["mcq", "dropdown", "short_text"]:
                if question.answer_type in ["mcq", "dropdown"] and value:
                    opt = question.options.filter(id=int(value)).first()
                    if opt:
                        user_demographics[response.id][question.title] = opt.text
                else:
                    user_demographics[response.id][question.title] = str(value)
            
            # Initialize question stats tracking
            if question.id not in question_stats:
                question_stats[question.id] = {
                    "text": question.title,
                    "type": question.answer_type,
                    "options": defaultdict(int),
                    "total_time": 0.0,
                    "response_count": 0
                }
            
            question_stats[question.id]["total_time"] += answer.time_taken if hasattr(answer, 'time_taken') else 0.0
            question_stats[question.id]["response_count"] += 1

            if question.answer_type in ["mcq", "checkbox", "dropdown", "linear"]:
                if question.answer_type == "linear":
                    score = float(value) if value else 0
                    question_stats[question.id]["options"][str(value)] += 1
                elif question.answer_type in ["mcq", "dropdown"]:
                    option = question.options.filter(id=value).first()
                    score = option.score if option else 0
                    if option:
                        question_stats[question.id]["options"][option.text] += 1
                elif question.answer_type == "checkbox":
                    score = 0
                    if isinstance(value, list):
                        for opt_id in value:
                            option = question.options.filter(id=opt_id).first()
                            if option:
                                score += option.score
                                question_stats[question.id]["options"][option.text] += 1

                if question.reverse_scored:
                    score = -score

                if question.construct:
                    response_construct_scores[response.id][question.construct] += score

    # Aggregate scores per construct across all responses to get distribution
    construct_scores_dist = defaultdict(list)
    for res_id, scores_dict in response_construct_scores.items():
        for construct, score in scores_dict.items():
            construct_scores_dist[construct].append(score)

    construct_averages = {}
    construct_distributions = {}

    for construct, scores in construct_scores_dist.items():
        if scores:
            construct_averages[construct] = sum(scores) / len(scores)
            construct_distributions[construct] = scores
        else:
            construct_averages[construct] = 0
            construct_distributions[construct] = []
            
    # Calculate Percentiles and Format Individual Responses
    individual_responses = []
    for response in responses:
        scores = response_construct_scores[response.id]
        percentiles = {}
        for construct, score in scores.items():
            percentiles[construct] = calculate_percentile(score, construct_scores_dist[construct])
            
        individual_responses.append({
            "id": response.id,
            "email": response.email or "Anonymous",
            "submitted_at": response.submitted_at.isoformat(),
            "scores": dict(scores),
            "percentiles": percentiles,
            "demographics": user_demographics[response.id]
        })

    # Calculate Correlation Matrix
    construct_names = list(construct_averages.keys())
    correlation_matrix = []
    
    if len(construct_names) > 1:
        for i, c1 in enumerate(construct_names):
            row = {"construct": c1}
            for j, c2 in enumerate(construct_names):
                if i == j:
                    row[c2] = 1.0
                elif j < i:
                    row[c2] = correlation_matrix[j][c1] # mirror
                else:
                    # Collect pairs of scores for these two constructs across all users
                    x_scores = []
                    y_scores = []
                    for res_id in response_construct_scores:
                        if c1 in response_construct_scores[res_id] and c2 in response_construct_scores[res_id]:
                            x_scores.append(response_construct_scores[res_id][c1])
                            y_scores.append(response_construct_scores[res_id][c2])
                    row[c2] = pearson_correlation(x_scores, y_scores)
            correlation_matrix.append(row)

    # Format question_stats for JSON serialization
    formatted_question_stats = []
    for q_id, data in question_stats.items():
        avg_time = data["total_time"] / data["response_count"] if data["response_count"] > 0 else 0
        
        # Include if it has option counts OR it's a type we want to show average time for like text/linear
        formatted_question_stats.append({
            "id": q_id,
            "text": data["text"],
            "type": data["type"],
            "avg_time": round(avg_time, 2),
            "options": [{"name": k, "count": v} for k, v in data["options"].items()]
        })

    # Demographic Cross Analysis
    # Group construct scores by answers to demographic questions
    cross_analysis = []
    # Find all unique demographic questions asked
    demo_questions = set()
    for d in user_demographics.values():
        demo_questions.update(d.keys())

    for demo_q in demo_questions:
        # Structure: groups[answer][construct] = [score1, score2, ...]
        groups = defaultdict(lambda: defaultdict(list))
        
        for response in responses:
            demo_answer = user_demographics[response.id].get(demo_q)
            if demo_answer:
                for construct, score in response_construct_scores[response.id].items():
                    groups[demo_answer][construct].append(score)
        
        if not groups: continue

        # Format for frontend
        demo_data = {"demographic": demo_q, "groups": []}
        for answer_val, constructs in groups.items():
            group_data = {"group_name": answer_val, "size": len(next(iter(constructs.values()), []))}
            for construct, scores_list in constructs.items():
                if scores_list:
                    group_data[construct] = round(sum(scores_list) / len(scores_list), 2)
            demo_data["groups"].append(group_data)
        
        cross_analysis.append(demo_data)

    return {
        "total_responses": total_responses,
        "timeline": timeline,
        "construct_averages": construct_averages,
        "construct_distributions": construct_distributions,
        "question_stats": formatted_question_stats,
        "individual_responses": sorted(individual_responses, key=lambda x: x["submitted_at"], reverse=True),
        "correlation_matrix": correlation_matrix,
        "construct_names": construct_names,
        "cross_analysis": cross_analysis
    }