// Background service worker for Minerva Auto-Register extension
// Handles registration logic, timing, and notifications

let registrationInterval = null;
let isRunning = false;
const COURSE_CODE_PATTERN = /^[A-Z]{4}-\d{3}-\d{3}$/;
const CRN_PATTERN = /^\d{4}$/;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRegistration') {
    startRegistration(message.settings);
    sendResponse({ success: true });
  } else if (message.action === 'stopRegistration') {
    stopRegistration();
    sendResponse({ success: true });
  }
});

// Start the registration process
async function startRegistration(settings) {
  if (isRunning) {
    console.log('Registration already running');
    return;
  }
  
  isRunning = true;
  console.log('Starting auto-registration...', settings);
  
  // Immediately try to register
  await attemptRegistration(settings);
  
  // Set up auto-refresh if enabled
  if (settings.autoRefresh) {
    registrationInterval = setInterval(() => {
      attemptRegistration(settings);
    }, 300000); // Every 5 minutes
  }
}

// Stop the registration process
function stopRegistration() {
  isRunning = false;
  
  if (registrationInterval) {
    clearInterval(registrationInterval);
    registrationInterval = null;
  }
  
  console.log('Auto-registration stopped');
}

// Attempt to register for all pending courses
async function attemptRegistration(settings) {
  console.log('Attempting registration...');
  
  try {
    const data = await chrome.storage.local.get(['courses', 'settings']);
    const { normalizedCourses, updated } = normalizeCourses(data.courses || []);
    
    if (updated) {
      await chrome.storage.local.set({ courses: normalizedCourses });
    }
    
    const pendingCourses = normalizedCourses.filter(c => c.status === 'pending');
    
    if (pendingCourses.length === 0) {
      console.log('No pending courses to register');
      stopRegistration();
      return;
    }
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }
    
    // Check if we're on Minerva
    if (!tab.url.includes('mcgill.ca')) {
      showNotification('Please navigate to Minerva', 
        'Open McGill Minerva to start registration', settings);
      return;
    }
    
    // Process each pending course
    for (const course of pendingCourses) {
      console.log(`Processing course: ${course.code}`);
      
      try {
        const result = await chrome.tabs.sendMessage(tab.id, {
          action: 'registerCourse',
          course: course
        });
        
        if (result.success) {
          // Update course status
          await updateCourseStatus(course.code, 'registered');
          
          // Show success notification
          showNotification(
            `Success! Registered for ${course.code}`,
            `You are now registered for ${course.code}`,
            settings
          );
        } else if (result.needsNavigation) {
          // Need to navigate to the right page
          console.log('Need to navigate to Add/Drop page');
        } else {
          // Registration failed
          console.log(`Failed to register for ${course.code}: ${result.error}`);
          
          if (result.error.includes('full') || result.error.includes('closed')) {
            await updateCourseStatus(course.code, 'full');
          } else {
            await updateCourseStatus(course.code, 'failed');
          }
        }
        
        // Wait a bit between courses to avoid overwhelming the system
        await sleep(2000);
        
      } catch (error) {
        console.error(`Error processing ${course.code}:`, error);
        
        // Content script might not be loaded yet
        if (error.message.includes('Could not establish connection')) {
          console.log('Content script not ready, will retry');
        }
      }
    }
    
    // Check if all courses are processed
    const remainingPending = await getRemainingPendingCourses();
    if (remainingPending === 0) {
      showNotification(
        'Registration Complete!',
        'All courses have been processed',
        settings
      );
      stopRegistration();
    }
    
  } catch (error) {
    console.error('Registration attempt failed:', error);
  }
}

// Update course status in storage
async function updateCourseStatus(courseCode, status) {
  const data = await chrome.storage.local.get(['courses']);
  let courses = data.courses || [];
  let updated = false;
  courses = courses.map(course => {
    if (!course.type) {
      updated = true;
      return { ...course, type: determineCourseType(course.code) };
    }
    return course;
  });
  
  const course = courses.find(c => c.code === courseCode);
  if (course) {
    course.status = status;
    course.lastUpdated = Date.now();
    
    await chrome.storage.local.set({ courses });
    
    // Notify popup to update UI
    chrome.runtime.sendMessage({
      action: 'updateCourses',
      courses: courses
    });
    
    console.log(`Updated ${courseCode} status to: ${status}`);
  }
}

// Get count of remaining pending courses
async function getRemainingPendingCourses() {
  const data = await chrome.storage.local.get(['courses']);
  const { normalizedCourses, updated } = normalizeCourses(data.courses || []);
  if (updated) {
    await chrome.storage.local.set({ courses: normalizedCourses });
  }
  return normalizedCourses.filter(c => c.status === 'pending').length;
}

// Show browser notification
function showNotification(title, message, settings) {
  if (settings && settings.notifications === false) {
    return;
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clean up when extension is disabled/unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopRegistration();
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Minerva Auto-Register installed');
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoRefresh: false,
        notifications: true
      },
      courses: [],
      isRunning: false
    });
  }
});

// Listen for tab updates to detect when user navigates to Minerva
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('mcgill.ca')) {
    console.log('Minerva page loaded');
    
    // Check if registration is running
    chrome.storage.local.get(['isRunning'], (data) => {
      if (data.isRunning) {
        // Inject content script if needed
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }).catch(err => {
          // Content script might already be injected
          console.log('Content script injection:', err.message);
        });
      }
    });
  }
});

// Periodic check to ensure registration is still running when it should be
setInterval(async () => {
  const data = await chrome.storage.local.get(['isRunning', 'settings']);
  
  if (data.isRunning && !isRunning) {
    // Registration should be running but isn't
    console.log('Restarting registration...');
    startRegistration(data.settings || {});
  } else if (!data.isRunning && isRunning) {
    // Registration shouldn't be running but is
    console.log('Stopping registration...');
    stopRegistration();
  }
}, 10000); // Check every 10 seconds

function determineCourseType(code = '') {
  if (CRN_PATTERN.test(code)) {
    return 'crn';
  }
  if (COURSE_CODE_PATTERN.test(code)) {
    return 'course';
  }
  return 'unknown';
}

function normalizeCourses(courses = []) {
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
