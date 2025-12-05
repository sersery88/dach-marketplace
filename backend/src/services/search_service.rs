//! Search service using Meilisearch
//! This module is only compiled when the "search" feature is enabled.

#[cfg(feature = "search")]
use meilisearch_sdk::client::Client;
#[cfg(feature = "search")]
use serde::{Deserialize, Serialize};

#[cfg(feature = "search")]
use crate::models::{ExpertProfile, Service};

#[cfg(feature = "search")]
pub struct SearchService {
    client: Client,
}

#[cfg(feature = "search")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ExpertSearchDocument {
    pub id: String,
    pub user_id: String,
    pub headline: String,
    pub bio: String,
    pub skills: Vec<String>,
    pub tools: Vec<String>,
    pub industries: Vec<String>,
    pub hourly_rate: i32,
    pub rating_average: f32,
    pub country: String,
    pub is_verified: bool,
}

#[cfg(feature = "search")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceSearchDocument {
    pub id: String,
    pub expert_id: String,
    pub title: String,
    pub description: String,
    pub short_description: String,
    pub category_id: String,
    pub price: i32,
    pub rating_average: f32,
    pub tags: Vec<String>,
}

#[cfg(feature = "search")]
impl SearchService {
    /// Create new search service
    pub fn new(url: &str, api_key: &str) -> Self {
        let client = Client::new(url, Some(api_key)).unwrap();
        Self { client }
    }

    /// Initialize search indexes
    pub async fn init_indexes(&self) -> Result<(), meilisearch_sdk::errors::Error> {
        // Create experts index
        let experts_index = self.client.index("experts");
        experts_index
            .set_searchable_attributes(&["headline", "bio", "skills", "tools", "industries"])
            .await?;
        experts_index
            .set_filterable_attributes(&["country", "is_verified", "hourly_rate", "rating_average", "skills", "tools"])
            .await?;
        experts_index
            .set_sortable_attributes(&["hourly_rate", "rating_average"])
            .await?;

        // Create services index
        let services_index = self.client.index("services");
        services_index
            .set_searchable_attributes(&["title", "description", "short_description", "tags"])
            .await?;
        services_index
            .set_filterable_attributes(&["category_id", "price", "rating_average", "tags"])
            .await?;
        services_index
            .set_sortable_attributes(&["price", "rating_average"])
            .await?;

        Ok(())
    }

    /// Index an expert
    pub async fn index_expert(&self, expert: &ExpertProfile) -> Result<(), meilisearch_sdk::errors::Error> {
        let doc = ExpertSearchDocument {
            id: expert.id.to_string(),
            user_id: expert.user_id.to_string(),
            headline: expert.headline.clone(),
            bio: expert.bio.clone(),
            skills: expert.skills.clone(),
            tools: expert.tools.clone(),
            industries: expert.industries.clone(),
            hourly_rate: expert.hourly_rate,
            rating_average: expert.rating_average,
            country: "ch".to_string(), // TODO: Get from user
            is_verified: expert.is_verified,
        };

        self.client
            .index("experts")
            .add_documents(&[doc], Some("id"))
            .await?;

        Ok(())
    }

    /// Index a service
    pub async fn index_service(&self, service: &Service) -> Result<(), meilisearch_sdk::errors::Error> {
        let doc = ServiceSearchDocument {
            id: service.id.to_string(),
            expert_id: service.expert_id.to_string(),
            title: service.title.clone(),
            description: service.description.clone(),
            short_description: service.short_description.clone(),
            category_id: service.category_id.to_string(),
            price: service.price,
            rating_average: service.rating_average,
            tags: service.tags.clone(),
        };

        self.client
            .index("services")
            .add_documents(&[doc], Some("id"))
            .await?;

        Ok(())
    }

    /// Search experts
    pub async fn search_experts(
        &self,
        query: &str,
        page: u32,
        per_page: u32,
    ) -> Result<Vec<ExpertSearchDocument>, meilisearch_sdk::errors::Error> {
        let results = self.client
            .index("experts")
            .search()
            .with_query(query)
            .with_offset(((page - 1) * per_page) as usize)
            .with_limit(per_page as usize)
            .execute::<ExpertSearchDocument>()
            .await?;

        Ok(results.hits.into_iter().map(|h| h.result).collect())
    }

    /// Search services
    pub async fn search_services(
        &self,
        query: &str,
        page: u32,
        per_page: u32,
    ) -> Result<Vec<ServiceSearchDocument>, meilisearch_sdk::errors::Error> {
        let results = self.client
            .index("services")
            .search()
            .with_query(query)
            .with_offset(((page - 1) * per_page) as usize)
            .with_limit(per_page as usize)
            .execute::<ServiceSearchDocument>()
            .await?;

        Ok(results.hits.into_iter().map(|h| h.result).collect())
    }
}

