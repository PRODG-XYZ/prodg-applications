#!/bin/bash

# Test script for Resend email integration

# Default values
TEST_EMAIL="test@example.com"

# Display help information
show_help() {
  echo "Usage: ./scripts/test-resend.sh [OPTIONS]"
  echo ""
  echo "Tests the Resend email integration by sending a test email."
  echo ""
  echo "Options:"
  echo "  -e, --email EMAIL    Email address to send the test to (default: test@example.com)"
  echo "  -h, --help           Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./scripts/test-resend.sh"
  echo "  ./scripts/test-resend.sh --email user@example.com"
  echo "  npm run test:resend -- -e user@example.com"
}

# If no arguments provided but SECOND_ARG exists, use it as the email
if [ $# -eq 0 ] && [ ! -z "$SECOND_ARG" ]; then
  TEST_EMAIL="$SECOND_ARG"
# If we have an argument that looks like an email address, use it directly
elif [ $# -eq 1 ] && [[ $1 == *@* ]]; then
  TEST_EMAIL="$1"
else
  # Parse command line arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --) # Skip the -- separator
        shift
        continue
        ;;
      -e|--email)
        # Check if the next argument exists and is not a flag
        if [[ $# -ge 2 && ! $2 == -* ]]; then
          TEST_EMAIL="$2"
          shift 2
        else
          echo "Error: Email address is required after -e/--email"
          show_help
          exit 1
        fi
        ;;
      -h|--help)
        show_help
        exit 0
        ;;
      *)
        # Check if it looks like an email address
        if [[ $1 == *@* ]]; then
          TEST_EMAIL="$1"
          shift
        else
          echo "Unknown option: $1"
          show_help
          exit 1
        fi
        ;;
    esac
  done
fi

# Check if .env.local or .env exists
ENV_FILE=""
if [ -f .env.local ]; then
  ENV_FILE=".env.local"
elif [ -f .env ]; then
  ENV_FILE=".env"
else
  echo "Warning: Neither .env.local nor .env file found. Creating .env.local based on env.example..."
  cp env.example .env.local
  ENV_FILE=".env.local"
  echo "Created .env.local file. Please update it with your actual values."
  exit 1
fi

# Check if RESEND_API_KEY is set in the ENV_FILE
if ! grep -q "RESEND_API_KEY=" "$ENV_FILE" || grep -q "RESEND_API_KEY=your_resend_api_key" "$ENV_FILE"; then
  echo "Error: RESEND_API_KEY is not set properly in $ENV_FILE"
  echo "Please update the $ENV_FILE file with your actual Resend API key."
  exit 1
fi

# Run the test email script
echo "Sending test email to $TEST_EMAIL..."
npx tsx scripts/test-email.ts "$TEST_EMAIL"

exit $? 