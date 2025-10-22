/**
 * Enables drag-to-scroll functionality for all elements with overflow-y-auto
 * Uses mouse events to implement smooth scrolling interaction
 */
export function enableDragToScroll() {
  // Find all elements with overflow-y-auto
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach(element => {
    let isMouseDown = false;
    let startY = 0;
    let scrollTop = 0;
    let isDragging = false;

    // Mouse down event - start drag
    element.addEventListener('mousedown', (e) => {
      // Only handle left mouse button
      if (e.button !== 0) return;
      
      isMouseDown = true;
      startY = e.clientY;
      scrollTop = element.scrollTop;
      isDragging = false;
      
      // Change cursor to indicate dragging state
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      
      // Prevent text selection while dragging
      e.preventDefault();
    });

    // Mouse move event - perform scroll
    element.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      
      e.preventDefault();
      
      const y = e.clientY;
      const deltaY = startY - y;
      
      // Set dragging flag if mouse has moved significantly
      if (Math.abs(deltaY) > 3) {
        isDragging = true;
      }
      
      // Scroll the element
      element.scrollTop = scrollTop + deltaY;
    });

    // Mouse up event - end drag
    element.addEventListener('mouseup', () => {
      isMouseDown = false;
      isDragging = false;
      
      // Reset cursor
      element.style.cursor = '';
      element.style.userSelect = '';
    });

    // Mouse leave event - handle case where mouse leaves element while dragging
    element.addEventListener('mouseleave', () => {
      isMouseDown = false;
      isDragging = false;
      
      // Reset cursor
      element.style.cursor = '';
      element.style.userSelect = '';
    });

    // Prevent click events when dragging (to avoid unintended clicks)
    element.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Add some visual feedback - change cursor on hover
    element.addEventListener('mouseenter', () => {
      if (!isMouseDown) {
        element.style.cursor = 'grab';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!isMouseDown) {
        element.style.cursor = '';
      }
    });
  });
}

/**
 * Enhanced version with momentum scrolling and smooth animations
 */
export function enableDragToScrollWithMomentum() {
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach(element => {
    let isMouseDown = false;
    let startY = 0;
    let scrollTop = 0;
    let isDragging = false;
    let lastY = 0;
    let velocity = 0;
    let lastTime = 0;
    let animationId = null;

    // Mouse down event
    element.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      
      // Cancel any ongoing momentum animation
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      isMouseDown = true;
      startY = e.clientY;
      lastY = e.clientY;
      scrollTop = element.scrollTop;
      isDragging = false;
      velocity = 0;
      lastTime = Date.now();
      
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      
      e.preventDefault();
    });

    // Mouse move event with velocity tracking
    element.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      
      e.preventDefault();
      
      const y = e.clientY;
      const deltaY = startY - y;
      const currentTime = Date.now();
      
      // Calculate velocity for momentum
      if (currentTime - lastTime > 0) {
        velocity = (lastY - y) / (currentTime - lastTime);
      }
      
      if (Math.abs(deltaY) > 3) {
        isDragging = true;
      }
      
      element.scrollTop = scrollTop + deltaY;
      
      lastY = y;
      lastTime = currentTime;
    });

    // Mouse up event with momentum
    element.addEventListener('mouseup', () => {
      isMouseDown = false;
      
      element.style.cursor = '';
      element.style.userSelect = '';
      
      // Apply momentum scrolling
      if (isDragging && Math.abs(velocity) > 0.5) {
        const momentumScroll = () => {
          velocity *= 0.95; // Deceleration factor
          
          if (Math.abs(velocity) > 0.1) {
            element.scrollTop += velocity * 16; // 16ms frame time
            animationId = requestAnimationFrame(momentumScroll);
          } else {
            animationId = null;
          }
        };
        
        momentumScroll();
      }
      
      // Reset dragging state after a short delay
      setTimeout(() => {
        isDragging = false;
      }, 100);
    });

    // Mouse leave event
    element.addEventListener('mouseleave', () => {
      isMouseDown = false;
      isDragging = false;
      
      element.style.cursor = '';
      element.style.userSelect = '';
    });

    // Prevent click events when dragging
    element.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Visual feedback
    element.addEventListener('mouseenter', () => {
      if (!isMouseDown) {
        element.style.cursor = 'grab';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!isMouseDown) {
        element.style.cursor = '';
      }
    });
  });
}

/**
 * Simple function to disable drag-to-scroll (removes event listeners)
 * Note: This is a simplified version - for production use, you'd want to 
 * store references to the event listeners for proper cleanup
 */
export function disableDragToScroll() {
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach(element => {
    // Reset cursor styles
    element.style.cursor = '';
    element.style.userSelect = '';
    
    // Note: To properly remove event listeners, you'd need to store 
    // references to the bound functions. This is a simplified example.
    // In a real implementation, consider using a class or object to 
    // manage the state and cleanup properly.
  });
}