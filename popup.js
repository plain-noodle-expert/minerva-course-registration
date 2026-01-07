// DOM Elements
const courseInput = document.getElementById('courseInput');
const addCourseBtn = document.getElementById('addCourse');
const courseList = document.getElementById('courseList');
const startBtn = document.getElementById('startRegistration');
const stopBtn = document.getElementById('stopRegistration');
const clearAllBtn = document.getElementById('clearAll');
const autoRefreshCheckbox = document.getElementById('autoRefresh');
const notificationsCheckbox = document.getElementById('notifications');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');

const COURSE_CODE_PATTERN = /^[A-Z]{4}-\d{3}-\d{3}$/;
const CRN_PATTERN = /^\d{4}$/;

// Load saved data
loadData();

// Event Listeners
addCourseBtn.addEventListener('click', addCourse);
courseInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCourse();
});

startBtn.addEventListener('click', startRegistration);
stopBtn.addEventListener('click', stopRegistration);
clearAllBtn.addEventListener('click', clearAll);

autoRefreshCheckbox.addEventListener('change', saveSettings);
notificationsCheckbox.addEventListener('change', saveSettings);

// Functions
async function loadData() {
  const data = await chrome.storage.local.get(['courses', 'settings', 'isRunning']);
  
  if (data.courses && data.courses.length > 0) {
    const { normalizedCourses, updated } = normalizeCourses(data.courses);
    if (updated) {
      chrome.storage.local.set({ courses: normalizedCourses });
    }
    renderCourses(normalizedCourses);
  }
  
  if (data.settings) {
    autoRefreshCheckbox.checked = data.settings.autoRefresh || false;
    notificationsCheckbox.checked = data.settings.notifications !== false;
  }
  
  if (data.isRunning) {
    updateUIState(true);
  }
}

function addCourse() {
  const courseCode = courseInput.value.trim().toUpperCase();
  
  const courseType = determineCourseType(courseCode);
  
  if (courseType === 'unknown') {
    showStatus('Invalid format! Use DEPT-NNN-NNN or 4-digit CRN', 'error');
    return;
  }
  
  chrome.storage.local.get(['courses'], (data) => {
    const courses = data.courses || [];
    
    if (courses.some(c => c.code === courseCode)) {
      showStatus('Course already added!', 'error');
      return;
    }
    
    const newCourse = {
      code: courseCode,
      type: courseType,
      status: 'pending',
      addedAt: Date.now()
    };
    
    courses.push(newCourse);
    
    chrome.storage.local.set({ courses }, () => {
      renderCourses(courses);
      courseInput.value = '';
      showStatus('Course added!', 'success');
    });
  });
}

function renderCourses(courses) {
  if (!courses || courses.length === 0) {
    courseList.innerHTML = '<p class="empty-state">No courses added yet</p>';
    return;
  }
  
  courseList.innerHTML = courses.map((course, index) => `
    <div class="course-item">
      <div>
        <div class="course-code">${formatCourseLabel(course)}</div>
        <div class="course-status">${getStatusText(course.status)}</div>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `).join('');
  
  // Add remove button listeners
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeCourse(index);
    });
  });
}

function getStatusText(status) {
  const statusMap = {
    'pending': '⏳ Pending',
    'registered': '✅ Registered',
    'failed': '❌ Failed',
    'full': '🚫 Full'
  };
  return statusMap[status] || status;
}

function removeCourse(index) {
  chrome.storage.local.get(['courses'], (data) => {
    const courses = data.courses || [];
    courses.splice(index, 1);
    chrome.storage.local.set({ courses }, () => {
      renderCourses(courses);
      showStatus('Course removed', 'success');
    });
  });
}

async function startRegistration() {
  const data = await chrome.storage.local.get(['courses', 'settings']);
  
  if (!data.courses || data.courses.length === 0) {
    showStatus('Add courses first!', 'error');
    return;
  }
  
  // Check if on Minerva
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url.includes('mcgill.ca')) {
    showStatus('Please open Minerva first!', 'error');
    return;
  }
  
  chrome.storage.local.set({ isRunning: true }, () => {
    chrome.runtime.sendMessage({ 
      action: 'startRegistration',
      settings: data.settings || {}
    });
    updateUIState(true);
    showStatus('Registration started!', 'active');
  });
}

function stopRegistration() {
  chrome.storage.local.set({ isRunning: false }, () => {
    chrome.runtime.sendMessage({ action: 'stopRegistration' });
    updateUIState(false);
    showStatus('Registration stopped', 'success');
  });
}

function clearAll() {
  if (confirm('Clear all courses?')) {
    chrome.storage.local.set({ courses: [], isRunning: false }, () => {
      renderCourses([]);
      updateUIState(false);
      showStatus('All courses cleared', 'success');
    });
  }
}

function saveSettings() {
  const settings = {
    autoRefresh: autoRefreshCheckbox.checked,
    notifications: notificationsCheckbox.checked
  };
  
  chrome.storage.local.set({ settings }, () => {
    showStatus('Settings saved', 'success');
  });
}

function updateUIState(isRunning) {
  if (isRunning) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    statusDot.classList.add('active');
  } else {
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    statusDot.classList.remove('active');
  }
}

function showStatus(message, type = 'success') {
  statusText.textContent = message;
  statusDot.className = 'status-dot';
  
  if (type === 'error') {
    statusDot.classList.add('error');
  } else if (type === 'active') {
    statusDot.classList.add('active');
  }
  
  setTimeout(() => {
    if (type !== 'active') {
      statusText.textContent = 'Ready';
      statusDot.className = 'status-dot';
    }
  }, 3000);
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateCourses') {
    renderCourses(message.courses);
  } else if (message.action === 'updateStatus') {
    showStatus(message.text, message.type);
  }
});

function determineCourseType(code) {
  if (CRN_PATTERN.test(code)) {
    return 'crn';
  }
  if (COURSE_CODE_PATTERN.test(code)) {
    return 'course';
  }
  return 'unknown';
}

function normalizeCourses(courses) {
  let updated = false;
  const normalizedCourses = courses.map(course => {
    if (!course.type) {
      updated = true;
      return { ...course, type: determineCourseType(course.code) };
    }
    return course;
  });
  return { normalizedCourses, updated };
}

function formatCourseLabel(course) {
  if (!course) return '';
  const type = course.type || determineCourseType(course.code);
  if (type === 'crn') {
    return `CRN ${course.code}`;
  }
  return course.code;
}
