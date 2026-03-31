export class InputManager {
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  // Active inputs processed by the game engine
  public swipeLeft: boolean = false;
  public swipeRight: boolean = false;
  public swipeUp: boolean = false;
  public swipeDown: boolean = false;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.attachListeners();
  }

  private attachListeners() {
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this.handleTouchEnd, {
      passive: false,
    });
    // Keyboard fallback for desktop testing
    window.addEventListener("keydown", this.handleKeyDown);
  }

  public destroy() {
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.touchStartX = e.changedTouches[0].screenX;
    this.touchStartY = e.changedTouches[0].screenY;
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    this.handleSwipe(this.touchStartX, this.touchStartY, touchEndX, touchEndY);
  };

  private handleSwipe(startX: number, startY: number, endX: number, endY: number) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > 30) {
        if (diffX > 0) {
          this.swipeRight = true;
        } else {
          this.swipeLeft = true;
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > 30) {
        if (diffY > 0) {
          this.swipeDown = true;
        } else {
          this.swipeUp = true;
        }
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a") this.swipeLeft = true;
    if (e.key === "ArrowRight" || e.key === "d") this.swipeRight = true;
    if (e.key === "ArrowUp" || e.key === "w") this.swipeUp = true;
    if (e.key === "ArrowDown" || e.key === "s") this.swipeDown = true;
  };

  // Called in game loop to reset triggers after processing
  public clearInputs() {
    this.swipeLeft = false;
    this.swipeRight = false;
    this.swipeUp = false;
    this.swipeDown = false;
  }
}
