#!/bin/bash

echo "========================================"
echo "Lecture Voice-to-Notes Generator"
echo "Backend Setup Script"
echo "========================================"
echo ""

echo "[1/5] Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi
echo "✓ Virtual environment created"
echo ""

echo "[2/5] Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

echo "[3/5] Upgrading pip..."
pip install --upgrade pip
echo "✓ Pip upgraded"
echo ""

echo "[4/5] Installing dependencies..."
echo "This may take several minutes (downloading AI models ~2GB)..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

echo "[5/5] Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your MongoDB credentials!"
else
    echo "✓ .env file already exists"
fi
echo ""

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your MongoDB URI"
echo "2. Run: source venv/bin/activate"
echo "3. Run: uvicorn app.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Documentation at: http://localhost:8000/docs"
echo ""
