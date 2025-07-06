#!/bin/bash

echo "🚀 Setting up Linear Integration for PeopleOS"
echo "============================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    
    # Add Linear configuration to .env.local
    cat >> .env.local << EOF

# Linear OAuth Configuration
LINEAR_CLIENT_ID=your_linear_client_id_here
LINEAR_CLIENT_SECRET=your_linear_client_secret_here
NEXT_PUBLIC_LINEAR_CLIENT_ID=your_linear_client_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/peopleos

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
EOF
    
    echo "✅ Created .env.local with Linear configuration"
else
    echo "⚠️  .env.local already exists. Please manually add Linear configuration."
fi

echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your Linear OAuth credentials:"
echo "   - LINEAR_CLIENT_ID (from your Linear OAuth app)"
echo "   - LINEAR_CLIENT_SECRET (from your Linear OAuth app)"
echo ""
echo "2. Ensure MongoDB is running:"
echo "   brew services start mongodb/brew/mongodb-community"
echo ""
echo "3. Start the development server:"
echo "   pnpm dev"
echo ""
echo "4. Test the integration:"
echo "   curl http://localhost:3000/api/linear/test"
echo ""
echo "5. Access the Linear Integration Panel:"
echo "   http://localhost:3000/management (navigate to Linear Integration)"
echo ""
echo "🔗 Linear OAuth App Setup:"
echo "1. Go to: https://linear.app/settings/api"
echo "2. Create new OAuth Application with:"
echo "   - Name: PeopleOS"
echo "   - Callback URL: http://localhost:3000/api/linear/auth/callback"
echo "   - Scopes: read, write"
echo ""
echo "✨ Integration is ready to configure!" 