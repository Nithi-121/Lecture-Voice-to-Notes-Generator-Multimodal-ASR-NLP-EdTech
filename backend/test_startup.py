try:
    print("Trying to import app.main...")
    from app.main import app
    print("Application imported successfully.")
except Exception as e:
    import traceback
    print("Error importing application:")
    traceback.print_exc()
