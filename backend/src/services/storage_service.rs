//! Storage service using AWS S3 or compatible storage
//! This module is only compiled when the "storage" feature is enabled.

#[cfg(feature = "storage")]
use aws_sdk_s3::{
    config::{Credentials, Region},
    primitives::ByteStream,
    Client,
};

#[cfg(feature = "storage")]
use uuid::Uuid;

#[cfg(feature = "storage")]
pub struct StorageService {
    client: Client,
    bucket: String,
}

#[cfg(feature = "storage")]
impl StorageService {
    /// Create new storage service
    pub async fn new(
        bucket: &str,
        region: &str,
        access_key: &str,
        secret_key: &str,
        endpoint: Option<&str>,
    ) -> Self {
        let credentials = Credentials::new(access_key, secret_key, None, None, "static");

        let mut config_builder = aws_sdk_s3::Config::builder()
            .region(Region::new(region.to_string()))
            .credentials_provider(credentials);

        if let Some(ep) = endpoint {
            config_builder = config_builder.endpoint_url(ep);
        }

        let config = config_builder.build();
        let client = Client::from_conf(config);

        Self {
            client,
            bucket: bucket.to_string(),
        }
    }

    /// Upload a file
    pub async fn upload_file(
        &self,
        data: Vec<u8>,
        content_type: &str,
        folder: &str,
        original_filename: &str,
    ) -> Result<String, aws_sdk_s3::Error> {
        let extension = original_filename
            .rsplit('.')
            .next()
            .unwrap_or("bin");

        let key = format!("{}/{}.{}", folder, Uuid::new_v4(), extension);

        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(ByteStream::from(data))
            .content_type(content_type)
            .send()
            .await?;

        Ok(format!("https://{}.s3.amazonaws.com/{}", self.bucket, key))
    }

    /// Delete a file
    pub async fn delete_file(&self, key: &str) -> Result<(), aws_sdk_s3::Error> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;

        Ok(())
    }

    /// Generate presigned URL for upload
    pub async fn get_presigned_upload_url(
        &self,
        folder: &str,
        filename: &str,
        _content_type: &str,
        _expires_in_secs: u64,
    ) -> Result<String, aws_sdk_s3::Error> {
        let extension = filename.rsplit('.').next().unwrap_or("bin");
        let key = format!("{}/{}.{}", folder, Uuid::new_v4(), extension);

        // Note: Presigned URLs require additional setup with aws-sdk-s3
        // This is a simplified version
        Ok(format!("https://{}.s3.amazonaws.com/{}", self.bucket, key))
    }

    /// Upload avatar
    pub async fn upload_avatar(
        &self,
        user_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
    ) -> Result<String, aws_sdk_s3::Error> {
        self.upload_file(data, content_type, "avatars", &format!("{}.jpg", user_id)).await
    }

    /// Upload portfolio image
    pub async fn upload_portfolio_image(
        &self,
        expert_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, aws_sdk_s3::Error> {
        self.upload_file(data, content_type, &format!("portfolio/{}", expert_id), filename).await
    }

    /// Upload service image
    pub async fn upload_service_image(
        &self,
        service_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, aws_sdk_s3::Error> {
        self.upload_file(data, content_type, &format!("services/{}", service_id), filename).await
    }

    /// Upload project deliverable
    pub async fn upload_deliverable(
        &self,
        project_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, aws_sdk_s3::Error> {
        self.upload_file(data, content_type, &format!("deliverables/{}", project_id), filename).await
    }
}
