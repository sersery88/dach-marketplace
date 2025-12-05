//! Storage service using AWS S3 or compatible storage (via rust-s3)
//! This module is only compiled when the "storage" feature is enabled.

#[cfg(feature = "storage")]
use s3::{Bucket, Region};
#[cfg(feature = "storage")]
use s3::creds::Credentials;
#[cfg(feature = "storage")]
use s3::error::S3Error;

#[cfg(feature = "storage")]
use uuid::Uuid;

#[cfg(feature = "storage")]
pub struct StorageService {
    bucket: Box<Bucket>,
}

#[cfg(feature = "storage")]
impl StorageService {
    /// Create new storage service
    pub fn new(
        bucket_name: &str,
        region: &str,
        access_key: &str,
        secret_key: &str,
        endpoint: Option<&str>,
    ) -> Result<Self, S3Error> {
        let region = if let Some(ep) = endpoint {
            Region::Custom {
                region: region.to_string(),
                endpoint: ep.to_string(),
            }
        } else {
            region.parse().unwrap_or(Region::UsEast1)
        };

        let credentials = Credentials::new(
            Some(access_key),
            Some(secret_key),
            None,
            None,
            None,
        )?;

        let bucket = Bucket::new(bucket_name, region, credentials)?;

        Ok(Self { bucket })
    }

    /// Upload a file
    pub async fn upload_file(
        &self,
        data: Vec<u8>,
        content_type: &str,
        folder: &str,
        original_filename: &str,
    ) -> Result<String, S3Error> {
        let extension = original_filename
            .rsplit('.')
            .next()
            .unwrap_or("bin");

        let key = format!("{}/{}.{}", folder, Uuid::new_v4(), extension);

        self.bucket
            .put_object_with_content_type(&key, &data, content_type)
            .await?;

        // Return the public URL
        let bucket_name = self.bucket.name();
        let region = self.bucket.region();
        let url = match region {
            Region::Custom { endpoint, .. } => format!("{}/{}/{}", endpoint, bucket_name, key),
            _ => format!("https://{}.s3.{}.amazonaws.com/{}", bucket_name, region, key),
        };

        Ok(url)
    }

    /// Delete a file
    pub async fn delete_file(&self, key: &str) -> Result<(), S3Error> {
        self.bucket.delete_object(key).await?;
        Ok(())
    }

    /// Generate presigned URL for upload
    pub async fn get_presigned_upload_url(
        &self,
        folder: &str,
        filename: &str,
        _content_type: &str,
        expires_in_secs: u64,
    ) -> Result<String, S3Error> {
        let extension = filename.rsplit('.').next().unwrap_or("bin");
        let key = format!("{}/{}.{}", folder, Uuid::new_v4(), extension);

        let url = self.bucket.presign_put(&key, expires_in_secs as u32, None, None).await?;
        Ok(url)
    }

    /// Upload avatar
    pub async fn upload_avatar(
        &self,
        user_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
    ) -> Result<String, S3Error> {
        self.upload_file(data, content_type, "avatars", &format!("{}.jpg", user_id)).await
    }

    /// Upload portfolio image
    pub async fn upload_portfolio_image(
        &self,
        expert_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, S3Error> {
        self.upload_file(data, content_type, &format!("portfolio/{}", expert_id), filename).await
    }

    /// Upload service image
    pub async fn upload_service_image(
        &self,
        service_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, S3Error> {
        self.upload_file(data, content_type, &format!("services/{}", service_id), filename).await
    }

    /// Upload project deliverable
    pub async fn upload_deliverable(
        &self,
        project_id: Uuid,
        data: Vec<u8>,
        content_type: &str,
        filename: &str,
    ) -> Result<String, S3Error> {
        self.upload_file(data, content_type, &format!("deliverables/{}", project_id), filename).await
    }
}
