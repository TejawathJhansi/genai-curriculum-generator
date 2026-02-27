let currentCurriculum = null;

async function generate() {
  const skill = document.getElementById('skill').value;
  const level = document.getElementById('level').value;

  if (!skill || !level) {
    alert('Please fill in Skill and Level!');
    return;
  }

  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').innerHTML = '';
  document.getElementById('downloadBtns').style.display = 'none';

  try {
    const res = await fetch('/api/generate-curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill: skill,
        level: level,
        semesters: document.getElementById('semesters').value,
        weekly_hours: document.getElementById('hours').value,
        industry_focus: document.getElementById('industry').value
      })
    });

    const data = await res.json();
    document.getElementById('loading').style.display = 'none';

    if (data.success) {
      currentCurriculum = data.curriculum;
      displayResults(data.curriculum);
      document.getElementById('downloadBtns').style.display = 'flex';
    } else {
      alert('Error: ' + data.error);
    }

  } catch(e) {
    document.getElementById('loading').style.display = 'none';
    alert('Connection error! Make sure the backend is running.');
  }
}

function displayResults(curriculum) {
  const div = document.getElementById('results');
  div.innerHTML = '';

  (curriculum.semesters || []).forEach(sem => {
    const semDiv = document.createElement('div');
    semDiv.className = 'semester';
    semDiv.innerHTML = `<h2>Semester ${sem.semester_number}</h2>`;

    (sem.courses || []).forEach(course => {
      const c = document.createElement('div');
      c.className = 'course';
      c.innerHTML = `
        <h3>${course.name}</h3>
        <p>${course.credits || 4} Credits</p>
        <div class='topics'>
          ${(course.topics || []).map(t => `<span class='topic'>${t}</span>`).join('')}
        </div>`;
      semDiv.appendChild(c);
    });

    div.appendChild(semDiv);
  });
}

async function downloadPDF() {
  if (!currentCurriculum) return;
  const res = await fetch('/api/download-pdf', {
    method: 'POST',
    headers: {
// script 
