#!/bin/bash

# Script to build and optionally push Docker image for jpay-nd
# Usage:
#   ./docker-build.sh                    # Build only
#   ./docker-build.sh push               # Build and push to registry
#   ./docker-build.sh push <registry>    # Build and push to specific registry

set -e

IMAGE_NAME="jpay-nd"
VERSION="${VERSION:-latest}"
REGISTRY="${DOCKER_REGISTRY:-}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building Docker image: ${IMAGE_NAME}:${VERSION}${NC}"

# Build the image
docker build -t "${IMAGE_NAME}:${VERSION}" .

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# If push argument is provided
if [ "$1" == "push" ]; then
  if [ -z "$REGISTRY" ] && [ -z "$2" ]; then
    echo -e "${YELLOW}⚠️  Warning: No registry specified.${NC}"
    echo "Set DOCKER_REGISTRY environment variable or provide as second argument:"
    echo "  ./docker-build.sh push docker.io/your-username"
    echo "  ./docker-build.sh push ghcr.io/your-username"
    exit 1
  fi

  # Use provided registry or environment variable
  if [ -n "$2" ]; then
    REGISTRY="$2"
  fi

  # Tag the image
  FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${VERSION}"
  echo -e "${BLUE}📦 Tagging image as: ${FULL_IMAGE_NAME}${NC}"
  docker tag "${IMAGE_NAME}:${VERSION}" "${FULL_IMAGE_NAME}"

  # Push the image
  echo -e "${BLUE}🚀 Pushing image to registry...${NC}"
  docker push "${FULL_IMAGE_NAME}"

  echo -e "${GREEN}✅ Image pushed successfully!${NC}"
  echo -e "${GREEN}📋 Use this image in Portainer: ${FULL_IMAGE_NAME}${NC}"
fi

echo -e "${GREEN}✨ Done!${NC}"
