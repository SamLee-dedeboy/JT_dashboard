// Example usage of drag-to-scroll functionality

import { 
  enableDragToScroll, 
  enableDragToScrollWithMomentum, 
  DragToScrollManager 
} from './dragToScroll';

// Method 1: Simple function call (enable for all overflow-y-auto elements)
export function initSimpleDragScroll() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableDragToScroll);
  } else {
    enableDragToScroll();
  }
}

// Method 2: Enhanced version with momentum
export function initMomentumDragScroll() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableDragToScrollWithMomentum);
  } else {
    enableDragToScrollWithMomentum();
  }
}

// Method 3: Class-based approach (recommended for production)
export class AppDragScrollManager {
  private manager = new DragToScrollManager();
  private isEnabled = false;

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enable());
    } else {
      this.enable();
    }
  }

  enable() {
    if (!this.isEnabled) {
      this.manager.enable();
      this.isEnabled = true;
    }
  }

  disable() {
    if (this.isEnabled) {
      this.manager.disable();
      this.isEnabled = false;
    }
  }

  // Re-enable after dynamic content changes
  refresh() {
    this.manager.disable();
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
      this.manager.enable();
    }, 50);
  }

  destroy() {
    this.manager.destroy();
    this.isEnabled = false;
  }
}

// Example for Svelte component usage
export function setupDragScrollForSvelte() {
  let dragScrollManager: DragToScrollManager;

  return {
    // Call this in onMount
    mount: () => {
      dragScrollManager = new DragToScrollManager();
      dragScrollManager.enable();
    },

    // Call this in onDestroy
    destroy: () => {
      if (dragScrollManager) {
        dragScrollManager.destroy();
      }
    },

    // Call this when content changes (e.g., after reactive updates)
    refresh: () => {
      if (dragScrollManager) {
        dragScrollManager.disable();
        setTimeout(() => dragScrollManager.enable(), 50);
      }
    }
  };
}