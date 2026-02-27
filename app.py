from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

MODEL_ID = "llama3"
OLLAMA_URL = "http://localhost:11434/api/generate"

def call_ollama(prompt):
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_ID,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.5
        }, timeout=120)
        if response.status_code == 200:
            return response.json().get('response', '').strip()
        return None
    except:
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate-curriculum', methods=['POST'])
def generate():
    data = request.json
    skill = data.get('skill', '')
    level = data.get('level', '')
    semesters = int(data.get('semesters', 2))
    hours = data.get('weekly_hours', '20')
    industry = data.get('industry_focus', 'General')

    prompt = f"""Create a {semesters}-semester {level} curriculum for {skill}.
Industry focus: {industry}. Weekly hours: {hours}.
Return JSON with: semesters (list), each with: semester_number, courses (list),
each course with: name, code, credits, topics (list of 4 topics)."""

    result = call_ollama(prompt)
    if result:
        try:
            curriculum = json.loads(result)
            return jsonify({"success": True, "curriculum": curriculum})
        except:
            return jsonify({"success": False, "error": "AI response error"})
    return jsonify({"success": False, "error": "Could not connect to AI"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    