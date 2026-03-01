#!/bin/bash
# Usage: source this script or run directly after setting GOOGLE_CLOUD_PROJECT

if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
  echo "Please set GOOGLE_CLOUD_PROJECT environment variable."
  exit 1
fi

# Build and push the container
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/output-predictor

# Deploy to Cloud Run
# assumes SECRET has been created with service account key
# You can either use the base64 env var or Secret Manager reference.

gcloud run deploy output-predictor \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/output-predictor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "SERVICE_ACCOUNT_KEY_BASE64=$SERVICE_ACCOUNT_KEY_BASE64"

# For secret manager variant:
# gcloud run deploy output-predictor \
#   --image gcr.io/$GOOGLE_CLOUD_PROJECT/output-predictor \
#   --platform managed \
#   --region us-central1 \
#   --allow-unauthenticated \
#   --set-secrets "SERVICE_ACCOUNT_KEY_BASE64=output-predict-sa:latest"

```
