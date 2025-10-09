import os
import uuid
from app import create_app
from app.services.s3_service import S3Service, S3Error

# Create a Flask app instance to establish an application context
app = create_app()

def test_happy_path(s3_service):
    """Tests a successful upload, presigned URL creation, and trash operation."""
    print("\n--- Testing Happy Path ---")
    s3_key = None
    try:
        # 1. Test Upload
        test_filename = "sample.txt"
        with open(test_filename, "rb") as f:
            print(f"Uploading '{test_filename}'...")
            s3_key = s3_service.upload_file(f, test_filename)
            print(f"✅ [SUCCESS] File uploaded. S3 Key: {s3_key}")

        # 2. Test Presigned URL
        print(f"\nCreating presigned URL for '{s3_key}'...")
        url = s3_service.create_presigned_url_for_download(s3_key)
        print(f"✅ [SUCCESS] Presigned URL generated (valid for 5 mins).")
        # print(f"   URL: {url[:70]}...") # Uncomment to see the URL

        # 3. Test Move to Trash
        print(f"\nMoving '{s3_key}' to trash...")
        trash_key = s3_service.move_file_to_trash(s3_key)
        print(f"✅ [SUCCESS] File moved to trash. New Key: {trash_key}")

        # 4. Test Double Trash (should not fail)
        print(f"\nAttempting to trash the same file again ('{trash_key}')...")
        s3_service.move_file_to_trash(trash_key)
        print(f"✅ [SUCCESS] Double trash handled gracefully.")

    except S3Error as e:
        print(f"❌ [FAILURE] Happy path test failed unexpectedly: {e}")
    return s3_key # Return key for other tests if needed


def test_missing_file_error(s3_service):
    """Tests that the service handles requests for non-existent files."""
    print("\n--- Testing Missing File Error ---")
    fake_key = f"{uuid.uuid4()}.txt"
    try:
        print(f"Attempting to move non-existent file '{fake_key}' to trash...")
        s3_service.move_file_to_trash(fake_key)
        # If we get here, the test failed because no error was raised
        print(f"❌ [FAILURE] The service did not raise an error for a missing file.")
    except S3Error:
        # This is the expected outcome
        print(f"✅ [SUCCESS] Service correctly raised an error for a missing file.")


if __name__ == '__main__':
    with app.app_context():
        try:
            s3 = S3Service()
            print("✅ S3Service initialized successfully.")
            
            # Run the sequence of tests
            test_happy_path(s3)
            test_missing_file_error(s3)

        except S3Error as e:
            print(f"❌ A critical S3 service error occurred during testing: {e}")
        except Exception as e:
            print(f"❌ An unexpected error occurred: {e}")