import os
import re
import json

SCALES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'neuroforms_scales')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'templates.json')

def parse_codebook(filepath):
    questions = []
    
    patterns = [
        re.compile(r'^\s*(?:Q\d+|[A-Za-z]+\d+|\d+)\s*[\.\t]+\s*(.+?)\s*$', re.IGNORECASE),
        re.compile(r'^\s*(?:Q\d+|[A-Za-z]+\d+|\d+)\s{2,}\s*(.+?)\s*$', re.IGNORECASE)
    ]
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                # Skip common non-question lines that might match unexpectedly
                if 'http' in line.lower() or 'www' in line.lower() or 'scale' in line.lower() and ('=' in line):
                    continue
                
                # Check for questions
                matched = False
                for pattern in patterns:
                    match = pattern.match(line)
                    if match:
                        q_text = match.group(1).strip()
                        # basic filter: question should be more than 1 word usually, and not just a single abbreviation
                        if len(q_text) > 5 and ' ' in q_text:
                            questions.append({
                                'title': q_text,
                                'answer_type': 'linear', # Defaulting to linear scale for psychology tests
                                'required': True
                            })
                        matched = True
                        break
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        
    return questions

def generate_templates():
    templates = []
    
    if not os.path.exists(SCALES_DIR):
        print(f"Directory {SCALES_DIR} not found.")
        return
        
    for category in os.listdir(SCALES_DIR):
        category_dir = os.path.join(SCALES_DIR, category)
        if not os.path.isdir(category_dir):
            continue
            
        for test_name in os.listdir(category_dir):
            test_dir = os.path.join(category_dir, test_name)
            if not os.path.isdir(test_dir):
                continue
                
            codebook_path = None
            for filename in os.listdir(test_dir):
                if 'codebook' in filename.lower() and filename.endswith('.txt'):
                    codebook_path = os.path.join(test_dir, filename)
                    break
            
            if codebook_path:
                questions = parse_codebook(codebook_path)
                if len(questions) > 5:  # Only include if we found a decent number of questions
                    templates.append({
                        'id': f"{category}_{test_name}",
                        'category': category.replace('_', ' '),
                        'name': test_name.replace('_', ' ').replace('-', ' ').title(),
                        'question_count': len(questions),
                        'questions': questions
                    })
    
    # Sort categories and names
    templates.sort(key=lambda x: (x['category'], x['name']))
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(templates, f, indent=2)
        
    print(f"Successfully created {OUTPUT_FILE} with {len(templates)} templates.")

if __name__ == '__main__':
    generate_templates()
