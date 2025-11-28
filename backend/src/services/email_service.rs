//! Email service using lettre
//! This module is only compiled when the "email" feature is enabled.

#[cfg(feature = "email")]
use lettre::{
    message::header::ContentType,
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};

#[cfg(feature = "email")]
pub struct EmailService {
    mailer: AsyncSmtpTransport<Tokio1Executor>,
    from_email: String,
    from_name: String,
}

#[cfg(feature = "email")]
impl EmailService {
    /// Create new email service
    pub fn new(
        smtp_host: &str,
        smtp_port: u16,
        smtp_user: &str,
        smtp_password: &str,
        from_email: &str,
        from_name: &str,
    ) -> Result<Self, lettre::transport::smtp::Error> {
        let creds = Credentials::new(smtp_user.to_string(), smtp_password.to_string());

        let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay(smtp_host)?
            .port(smtp_port)
            .credentials(creds)
            .build();

        Ok(Self {
            mailer,
            from_email: from_email.to_string(),
            from_name: from_name.to_string(),
        })
    }

    /// Send email
    pub async fn send_email(
        &self,
        to: &str,
        subject: &str,
        html_body: &str,
    ) -> Result<(), lettre::transport::smtp::Error> {
        let email = Message::builder()
            .from(format!("{} <{}>", self.from_name, self.from_email).parse().unwrap())
            .to(to.parse().unwrap())
            .subject(subject)
            .header(ContentType::TEXT_HTML)
            .body(html_body.to_string())
            .unwrap();

        self.mailer.send(email).await?;
        Ok(())
    }

    /// Send verification email
    pub async fn send_verification_email(
        &self,
        to: &str,
        name: &str,
        verification_url: &str,
    ) -> Result<(), lettre::transport::smtp::Error> {
        let html = format!(
            r#"
            <h1>Willkommen bei DACH Marketplace!</h1>
            <p>Hallo {name},</p>
            <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
            <p><a href="{verification_url}">E-Mail bestätigen</a></p>
            <p>Dieser Link ist 24 Stunden gültig.</p>
            <p>Mit freundlichen Grüßen,<br>Das DACH Marketplace Team</p>
            "#
        );

        self.send_email(to, "Bestätigen Sie Ihre E-Mail-Adresse", &html).await
    }

    /// Send password reset email
    pub async fn send_password_reset_email(
        &self,
        to: &str,
        name: &str,
        reset_url: &str,
    ) -> Result<(), lettre::transport::smtp::Error> {
        let html = format!(
            r#"
            <h1>Passwort zurücksetzen</h1>
            <p>Hallo {name},</p>
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
            <p><a href="{reset_url}">Passwort zurücksetzen</a></p>
            <p>Dieser Link ist 1 Stunde gültig.</p>
            <p>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
            <p>Mit freundlichen Grüßen,<br>Das DACH Marketplace Team</p>
            "#
        );

        self.send_email(to, "Passwort zurücksetzen", &html).await
    }

    /// Send new message notification
    pub async fn send_message_notification(
        &self,
        to: &str,
        sender_name: &str,
        message_preview: &str,
    ) -> Result<(), lettre::transport::smtp::Error> {
        let html = format!(
            r#"
            <h1>Neue Nachricht</h1>
            <p>Sie haben eine neue Nachricht von {sender_name}:</p>
            <blockquote>{message_preview}</blockquote>
            <p><a href="https://dach-marketplace.com/messages">Zur Nachricht</a></p>
            "#
        );

        self.send_email(to, &format!("Neue Nachricht von {}", sender_name), &html).await
    }

    /// Send project update notification
    pub async fn send_project_update(
        &self,
        to: &str,
        project_title: &str,
        status: &str,
    ) -> Result<(), lettre::transport::smtp::Error> {
        let html = format!(
            r#"
            <h1>Projekt-Update</h1>
            <p>Der Status Ihres Projekts "{project_title}" wurde aktualisiert:</p>
            <p><strong>Neuer Status: {status}</strong></p>
            <p><a href="https://dach-marketplace.com/projects">Zum Projekt</a></p>
            "#
        );

        self.send_email(to, &format!("Projekt-Update: {}", project_title), &html).await
    }
}

