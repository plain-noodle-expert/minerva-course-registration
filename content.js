// Content script for Minerva course registration
// This script interacts with the Minerva page to automatically register for courses

console.log('Minerva Auto-Register: Content script loaded');

const COURSE_CODE_PATTERN = /^[A-Z]{4}-\d{3}-\d{3}$/;
const CRN_PATTERN = /^\d{4}$/;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'registerCourse') {
    const coursePayload = message.course || { code: message.courseCode };
    registerCourse(coursePayload)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'checkMinervaPage') {
    sendResponse({ 
      success: true, 
      page: detectMinervaPage(),
      loggedIn: checkIfLoggedIn()
    });
    return true;
  }
});

// Detect which Minerva page we're on
function detectMinervaPage() {
  const url = window.location.href;
  const title = document.title;
  
  if (url.includes('bwskfreg.P_AltPin') || title.includes('Add/Drop')) {
    return 'add_drop';
  } else if (url.includes('twbkwbis.P_GenMenu') || title.includes('Student Menu')) {
    return 'main_menu';
  } else if (url.includes('bwckgens.p_proc_term_date')) {
    return 'term_selection';
  }
  
  return 'unknown';
}

// Check if user is logged in
function checkIfLoggedIn() {
  // Check for common elements that appear when logged in
  const hasUserInfo = document.querySelector('.userinfo') !== null;
  const hasLogoutLink = document.querySelector('a[href*="logout"]') !== null;
  const hasMainMenu = document.querySelector('.pagebodydiv') !== null;
  
  return hasUserInfo || hasLogoutLink || hasMainMenu;
}

// Main function to register a course
async function registerCourse(courseData) {
  const courseCode = typeof courseData === 'string' ? courseData : courseData?.code;
  const courseType = courseData?.type || determineCourseType(courseCode);
  
  if (!courseCode) {
    throw new Error('No course information provided');
  }
  
  console.log(`Attempting to register for: ${courseType === 'crn' ? 'CRN ' : ''}${courseCode}`);
  
  // Check if we're on the right page
  const page = detectMinervaPage();
  
  if (page !== 'add_drop') {
    return {
      success: false,
      error: 'Not on the Add/Drop courses page',
      needsNavigation: true
    };
  }
  
  try {
    let crn = null;
    
    if (courseType === 'crn') {
      crn = courseCode;
    } else if (courseType === 'course') {
      // Parse the course code (e.g., COMP-251-001 -> COMP 251 001)
      const parts = courseCode.split('-');
      if (parts.length !== 3) {
        throw new Error('Invalid course code format');
      }
      
      const [subject, number, section] = parts;
      crn = await findCourseCRN(subject, number, section);
    } else {
      throw new Error('Unsupported course format');
    }
    
    if (!crn) {
      return {
        success: false,
        error: 'Could not find CRN for this course'
      };
    }
    
    // Enter CRN in the registration form
    const success = await enterCRN(crn);
    
    if (success) {
      // Submit the form
      const result = await submitRegistration();
      
      if (result && typeof result.success === 'boolean') {
        return result.success
          ? { success: true, message: `Successfully registered for ${courseCode}` }
          : result;
      }
      
      return { success: true, message: `Successfully registered for ${courseCode}` };
    } else {
      return {
        success: false,
        error: 'Could not enter CRN in form'
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Find the CRN (Course Reference Number) for a course
async function findCourseCRN(subject, number, section) {
  // In Minerva, we need to search for the course or navigate to course lookup
  // This is a simplified version - actual implementation would depend on Minerva's structure
  
  // Try to find the course in the current page if we're on a search results page
  const courseLinks = document.querySelectorAll('a[href*="bwckschd.p_disp_detail_sched"]');
  
  for (const link of courseLinks) {
    const linkText = link.textContent;
    if (linkText.includes(subject) && linkText.includes(number) && linkText.includes(section)) {
      // Extract CRN from the link or surrounding elements
      const row = link.closest('tr');
      const crnElement = row?.querySelector('td:first-child');
      if (crnElement) {
        return crnElement.textContent.trim();
      }
    }
  }
  
  // Alternative: Look for CRN in the page data
  const pageText = document.body.innerText;
  const crnPattern = new RegExp(`${subject}\\s+${number}\\s+${section}.*?(\\d{4})`, 'i');
  const match = pageText.match(crnPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

// Enter CRN in the registration form
async function enterCRN(crn) {
  // Find available CRN input field
  const crnInputs = document.querySelectorAll('input[name^="CRN_IN"]');
  
  for (const input of crnInputs) {
    if (!input.value || input.value.trim() === '') {
      input.value = crn;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`Entered CRN ${crn} in field ${input.name}`);
      return true;
    }
  }
  
  console.warn('No empty CRN input field found');
  return false;
}

// Submit the registration form
async function submitRegistration() {
  // Find the submit button
  const submitButton = document.querySelector('input[type="submit"][value*="Submit"]');
  
  if (submitButton) {
    console.log('Submitting registration form...');
    submitButton.click();
    
    // Wait for the page to process
    await waitForPageLoad();
    
    // Check for success or error messages
    const result = checkRegistrationResult();
    return result;
  } else {
    throw new Error('Could not find submit button');
  }
}

// Wait for page to load after submission
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      setTimeout(resolve, 1000); // Wait a bit for any dynamic updates
    } else {
      window.addEventListener('load', () => {
        setTimeout(resolve, 1000);
      });
    }
  });
}

// Check the result of the registration attempt
function checkRegistrationResult() {
  const pageText = document.body.innerText.toLowerCase();
  
  // Check for success messages
  if (pageText.includes('registered') || pageText.includes('success')) {
    return { success: true, message: 'Course registered successfully' };
  }
  
  // Check for error messages
  if (pageText.includes('closed') || pageText.includes('full')) {
    return { success: false, error: 'Course is full or closed' };
  }
  
  if (pageText.includes('time conflict')) {
    return { success: false, error: 'Time conflict with another course' };
  }
  
  if (pageText.includes('prerequisite')) {
    return { success: false, error: 'Prerequisite not met' };
  }
  
  if (pageText.includes('maximum hours')) {
    return { success: false, error: 'Maximum credit hours exceeded' };
  }
  
  // Look for error elements
  const errorElements = document.querySelectorAll('.errortext, .error, [class*="error"]');
  if (errorElements.length > 0) {
    const errorText = Array.from(errorElements)
      .map(el => el.textContent.trim())
      .join('; ');
    return { success: false, error: errorText };
  }
  
  return { success: false, error: 'Unknown result - please check Minerva manually' };
}

// Helper function to navigate to Add/Drop page
function navigateToAddDrop() {
  const addDropLink = document.querySelector('a[href*="bwskfreg.P_AltPin"]');
  if (addDropLink) {
    addDropLink.click();
    return true;
  }
  return false;
}

// Auto-inject a visual indicator when extension is active
function showExtensionIndicator() {
  if (document.getElementById('minerva-extension-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'minerva-extension-indicator';
  indicator.innerHTML = '🎓 Auto-Register Active';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4caf50;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;
  
  document.body.appendChild(indicator);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    indicator.style.opacity = '0.3';
  }, 5000);
}

// Initialize
if (checkIfLoggedIn()) {
  console.log('Minerva Auto-Register: User is logged in');
}

function determineCourseType(code = '') {
  if (CRN_PATTERN.test(code)) {
    return 'crn';
  }
  if (COURSE_CODE_PATTERN.test(code)) {
    return 'course';
  }
  return 'unknown';
}
