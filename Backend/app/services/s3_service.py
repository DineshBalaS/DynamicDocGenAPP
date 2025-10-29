import os
import uuid
import boto3
import requests 
from io import BytesIO
from botocore.exceptions import ClientError
from flask import current_app

# --- Custom Exception Classes ---

class S3Error(Exception):
    """Base exception for S3 service errors."""
    pass

class S3UploadError(S3Error):
    """Raised when a file upload to S3 fails."""
    pass

class S3ConfigError(S3Error):
    """Raised when S3 configuration is missing."""
    pass


# --- S3 Service Class ---

class S3Service:
    """
    A service class for handling all interactions with Amazon S3.
    """
    def __init__(self):
        """
        Initializes the S3Service.

        Reads AWS credentials and S3 configuration from the Flask app context,
        validates them, and initializes the Boto3 S3 client.

        Raises:
            S3ConfigError: If any required S3 configuration is missing.
        """
        config = current_app.config
        self.bucket_name = config.get('S3_BUCKET_NAME')
        aws_access_key_id = config.get('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = config.get('AWS_SECRET_ACCESS_KEY')
        aws_region = config.get('AWS_REGION')

        # Validate that all required configuration variables are present
        if not all([self.bucket_name, aws_access_key_id, aws_secret_access_key, aws_region]):
            raise S3ConfigError("Missing required S3 configuration in the application.")

        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=aws_region
            )
        except Exception as e:
            # Catch potential Boto3 initialization errors
            raise S3ConfigError(f"Failed to initialize Boto3 client: {e}")

    def upload_file(self, file_stream, original_filename: str, prefix: str = "") -> str:
        """
        Uploads a file stream to the S3 bucket with a unique name.

        Args:
            file_stream: The file-like object to upload.
            original_filename: The original name of the file, used for its extension.

        Returns:
            The unique s3_key generated for the uploaded file.

        Raises:
            S3UploadError: If the upload fails.
        """
        _, file_extension = os.path.splitext(original_filename)
        s3_key = f"{prefix}{uuid.uuid4()}{file_extension}"

        try:
            self.s3_client.upload_fileobj(
                file_stream,
                self.bucket_name,
                s3_key
            )
            return s3_key
        except ClientError as e:
            # In a real app, you would log this error
            print(f"S3 Upload Error: {e}")
            raise S3UploadError(f"Failed to upload '{original_filename}' to S3.")
        
    def upload_file_from_url(self, image_url: str, prefix: str = "") -> str:
        """
        Downloads an image from a URL and uploads it to S3.

        Args:
            image_url: The URL of the image to download.
            prefix: The prefix to add to the S3 key.

        Returns:
            The unique s3_key for the uploaded file.

        Raises:
            S3UploadError: If the download or upload fails.
        """
        try:
            # It's good practice to use a timeout for external requests
            response = requests.get(image_url, stream=True, timeout=10)
            response.raise_for_status()  # Will raise an exception for 4xx/5xx responses

            # Use a generic filename; the extension will be determined later
            # A more robust solution could inspect the 'Content-Type' header
            _, file_extension = os.path.splitext(image_url.split('?')[0]) # Basic extension extraction
            if not file_extension:
                file_extension = ".jpg" # Default if no extension found

            s3_key = f"{prefix}{uuid.uuid4()}{file_extension}"

            self.s3_client.upload_fileobj(
                response.raw,
                self.bucket_name,
                s3_key
            )
            return s3_key
        except requests.exceptions.RequestException as e:
            print(f"Image download error from URL {image_url}: {e}")
            raise S3UploadError(f"Failed to download image from the provided URL.")
        except ClientError as e:
            print(f"S3 Upload Error from URL: {e}")
            raise S3UploadError("Failed to upload the downloaded image to S3.")
        
    def download_file_as_stream(self, s3_key: str) -> BytesIO:
        """Downloads an S3 object into an in-memory stream."""
        try:
            stream = BytesIO()
            self.s3_client.download_fileobj(self.bucket_name, s3_key, stream)
            stream.seek(0)  # Rewind the stream to the beginning for reading
            return stream
        except ClientError as e:
            print(f"S3 Download Error: {e}")
            raise S3Error(f"Failed to download file '{s3_key}' from S3.")


    def create_presigned_url_for_download(self, s3_key: str) -> str:
        """
        Generates a temporary, secure URL to download an object from S3.

        Args:
            s3_key: The unique key of the object in the S3 bucket.

        Returns:
            A string containing the pre-signed URL.

        Raises:
            S3Error: If generating the URL fails.
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=300  # URL is valid for 5 minutes
            )
            return url
        except ClientError as e:
            print(f"S3 Presigned URL Error: {e}")
            raise S3Error(f"Failed to create presigned URL for '{s3_key}'.")

    def move_file_to_trash(self, s3_key: str) -> str:
        """
        Moves a file to a 'trash/' directory within the S3 bucket.

        This performs a copy to the trash location and then deletes the original.

        Args:
            s3_key: The unique key of the object to move.

        Returns:
            The new key of the object in the trash directory.

        Raises:
            S3Error: If the copy or delete operation fails.
        """
        if 'trash/' in s3_key:
            # Avoid re-trashing an already trashed file
            return s3_key
            
        trash_key = f"trash/{s3_key}"
        copy_source = {'Bucket': self.bucket_name, 'Key': s3_key}

        try:
            # 1. Copy the object to the trash location
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=trash_key
            )

            # 2. Delete the original object only after the copy succeeds
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            
            return trash_key
        except ClientError as e:
            print(f"S3 Trash Error: {e}")
            raise S3Error(f"Failed to move file '{s3_key}' to trash.")
    
    def restore_file_from_trash(self, s3_key_in_trash: str) -> str:
        """
        Moves a file out of the 'trash/' directory back to the root of the S3 bucket.

        This performs a copy to the root location and then deletes the object
        from the trash directory.

        Args:
            s3_key_in_trash: The unique key of the object within the trash/ prefix.

        Returns:
            The original key of the object in the root directory.

        Raises:
            ValueError: If the provided key does not start with 'trash/'.
            S3Error: If the copy or delete operation fails.
        """
        if not s3_key_in_trash.startswith('trash/'):
            raise ValueError(f"Key '{s3_key_in_trash}' does not appear to be in the trash directory.")

        # Calculate the original key by removing the prefix
        original_key = s3_key_in_trash[len('trash/'):]
        if not original_key: # Handle edge case of just "trash/"
             raise ValueError("Invalid key provided for restoration.")

        copy_source = {'Bucket': self.bucket_name, 'Key': s3_key_in_trash}

        try:
            # 1. Copy the object back to the root location
            current_app.logger.info(f"Restoring {s3_key_in_trash} to {original_key}")
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=original_key
            )

            # 2. Delete the object from the trash directory only after the copy succeeds
            current_app.logger.info(f"Deleting object {s3_key_in_trash} from trash after restore")
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key_in_trash
            )

            return original_key
        except ClientError as e:
            current_app.logger.error(f"S3 Restore Error for {s3_key_in_trash}: {e}")
            # Consider more specific error handling if needed (e.g., if copy succeeds but delete fails)
            raise S3Error(f"Failed to restore file '{s3_key_in_trash}' from trash.")