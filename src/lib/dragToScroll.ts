/**
 * Enables drag-to-scroll functionality for all elements with overflow-y-auto
 * Uses mouse events to implement smooth scrolling interaction
 */
export function enableDragToScroll(): void {
  // Find all elements with overflow-y-auto
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    let isMouseDown = false;
    let startY = 0;
    let scrollTop = 0;
    let isDragging = false;

    // Mouse down event - start drag
    htmlElement.addEventListener('mousedown', (e: MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;
      
      isMouseDown = true;
      startY = e.clientY;
      scrollTop = htmlElement.scrollTop;
      isDragging = false;
      
      // Change cursor to indicate dragging state
      htmlElement.style.cursor = 'grabbing';
      htmlElement.style.userSelect = 'none';
      
      // Prevent text selection while dragging
      e.preventDefault();
    });

    // Mouse move event - perform scroll
    htmlElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      e.preventDefault();
      
      const y = e.clientY;
      const deltaY = startY - y;
      
      // Set dragging flag if mouse has moved significantly
      if (Math.abs(deltaY) > 3) {
        isDragging = true;
      }
      
      // Scroll the element
      htmlElement.scrollTop = scrollTop + deltaY;
    });

    // Mouse up event - end drag
    htmlElement.addEventListener('mouseup', () => {
      isMouseDown = false;
      isDragging = false;
      
      // Reset cursor
      htmlElement.style.cursor = '';
      htmlElement.style.userSelect = '';
    });

    // Mouse leave event - handle case where mouse leaves element while dragging
    htmlElement.addEventListener('mouseleave', () => {
      isMouseDown = false;
      isDragging = false;
      
      // Reset cursor
      htmlElement.style.cursor = '';
      htmlElement.style.userSelect = '';
    });

    // Prevent click events when dragging (to avoid unintended clicks)
    htmlElement.addEventListener('click', (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Add some visual feedback - change cursor on hover
    htmlElement.addEventListener('mouseenter', () => {
      if (!isMouseDown) {
        htmlElement.style.cursor = 'grab';
      }
    });

    htmlElement.addEventListener('mouseleave', () => {
      if (!isMouseDown) {
        htmlElement.style.cursor = '';
      }
    });
  });
}

/**
 * Enhanced version with momentum scrolling and smooth animations
 */
export function enableDragToScrollWithMomentum(): void {
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    let isMouseDown = false;
    let startY = 0;
    let scrollTop = 0;
    let isDragging = false;
    let lastY = 0;
    let velocity = 0;
    let lastTime = 0;
    let animationId: number | null = null;

    // Mouse down event
    htmlElement.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return;
      
      // Cancel any ongoing momentum animation
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      isMouseDown = true;
      startY = e.clientY;
      lastY = e.clientY;
      scrollTop = htmlElement.scrollTop;
      isDragging = false;
      velocity = 0;
      lastTime = Date.now();
      
      htmlElement.style.cursor = 'grabbing';
      htmlElement.style.userSelect = 'none';
      
      e.preventDefault();
    });

    // Mouse move event with velocity tracking
    htmlElement.addEventListener('mousemove', (e: MouseEvent) => {
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
      
      htmlElement.scrollTop = scrollTop + deltaY;
      
      lastY = y;
      lastTime = currentTime;
    });

    // Mouse up event with momentum
    htmlElement.addEventListener('mouseup', () => {
      isMouseDown = false;
      
      htmlElement.style.cursor = '';
      htmlElement.style.userSelect = '';
      
      // Apply momentum scrolling
      if (isDragging && Math.abs(velocity) > 0.5) {
        const momentumScroll = (): void => {
          velocity *= 0.95; // Deceleration factor
          
          if (Math.abs(velocity) > 0.1) {
            htmlElement.scrollTop += velocity * 16; // 16ms frame time
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
    htmlElement.addEventListener('mouseleave', () => {
      isMouseDown = false;
      isDragging = false;
      
      htmlElement.style.cursor = '';
      htmlElement.style.userSelect = '';
    });

    // Prevent click events when dragging
    htmlElement.addEventListener('click', (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Visual feedback
    htmlElement.addEventListener('mouseenter', () => {
      if (!isMouseDown) {
        htmlElement.style.cursor = 'grab';
      }
    });

    htmlElement.addEventListener('mouseleave', () => {
      if (!isMouseDown) {
        htmlElement.style.cursor = '';
      }
    });
  });
}

/**
 * Simple function to disable drag-to-scroll (removes event listeners)
 * Note: This is a simplified version - for production use, you'd want to 
 * store references to the event listeners for proper cleanup
 */
export function disableDragToScroll(): void {
  const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
  
  scrollableElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    // Reset cursor styles
    htmlElement.style.cursor = '';
    htmlElement.style.userSelect = '';
    
    // Note: To properly remove event listeners, you'd need to store 
    // references to the bound functions. This is a simplified example.
    // In a real implementation, consider using a class or object to 
    // manage the state and cleanup properly.
  });
}

/**
 * Class-based implementation for better event listener management
 */
export class DragToScrollManager {
  private elements: Map<HTMLElement, {
    mousedown: (e: MouseEvent) => void;
    mousemove: (e: MouseEvent) => void;
    mouseup: () => void;
    mouseleave: () => void;
    click: (e: MouseEvent) => void;
    mouseenter: () => void;
  }> = new Map();

  enable(): void {
    const scrollableElements = document.querySelectorAll('.overflow-y-auto, [style*="overflow-y: auto"]');
    
    scrollableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Skip if already enabled
      if (this.elements.has(htmlElement)) return;
      
      let isMouseDown = false;
      let startY = 0;
      let scrollTop = 0;
      let isDragging = false;

      const handlers = {
        mousedown: (e: MouseEvent) => {
          if (e.button !== 0) return;
          
          isMouseDown = true;
          startY = e.clientY;
          scrollTop = htmlElement.scrollTop;
          isDragging = false;
          
          htmlElement.style.cursor = 'grabbing';
          htmlElement.style.userSelect = 'none';
          
          e.preventDefault();
        },

        mousemove: (e: MouseEvent) => {
          if (!isMouseDown) return;
          
          e.preventDefault();
          
          const y = e.clientY;
          const deltaY = startY - y;
          
          if (Math.abs(deltaY) > 3) {
            isDragging = true;
          }
          
          htmlElement.scrollTop = scrollTop + deltaY;
        },

        mouseup: () => {
          isMouseDown = false;
          isDragging = false;
          
          htmlElement.style.cursor = '';
          htmlElement.style.userSelect = '';
        },

        mouseleave: () => {
          isMouseDown = false;
          isDragging = false;
          
          htmlElement.style.cursor = '';
          htmlElement.style.userSelect = '';
        },

        click: (e: MouseEvent) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        },

        mouseenter: () => {
          if (!isMouseDown) {
            htmlElement.style.cursor = 'grab';
          }
        }
      };

      // Add event listeners
      htmlElement.addEventListener('mousedown', handlers.mousedown);
      htmlElement.addEventListener('mousemove', handlers.mousemove);
      htmlElement.addEventListener('mouseup', handlers.mouseup);
      htmlElement.addEventListener('mouseleave', handlers.mouseleave);
      htmlElement.addEventListener('click', handlers.click, true);
      htmlElement.addEventListener('mouseenter', handlers.mouseenter);

      // Store handlers for cleanup
      this.elements.set(htmlElement, handlers);
    });
  }

  disable(): void {
    this.elements.forEach((handlers, element) => {
      // Remove event listeners
      element.removeEventListener('mousedown', handlers.mousedown);
      element.removeEventListener('mousemove', handlers.mousemove);
      element.removeEventListener('mouseup', handlers.mouseup);
      element.removeEventListener('mouseleave', handlers.mouseleave);
      element.removeEventListener('click', handlers.click, true);
      element.removeEventListener('mouseenter', handlers.mouseenter);

      // Reset styles
      element.style.cursor = '';
      element.style.userSelect = '';
    });

    this.elements.clear();
  }

  destroy(): void {
    this.disable();
  }
}