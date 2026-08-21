import os
import sys

# Ensure backend package is in sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "AI-Based-Drought-Resistance-In-Machine-Learning", "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except ImportError:
    # If directory structure differs or running directly inside backend
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)
    from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)