#!/bin/bash
# Activate virtual environment if present
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the application as a module
python3 -m app.main
