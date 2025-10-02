# Natural Language Alarm Control System

A Dockerized alarm system that accepts natural language commands and converts them to REST API calls using OpenAI's LLM with regex fallback.

## TL;DR - Quick Start

```bash
git clone <your-repo>
cd alarm-app
docker compose up --build
```

Then visit:
- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:4000/healthz
- **Test Command**: 
  ```bash
  curl -X POST http://localhost:4000/nl/execute \
    -H "Content-Type: application/json" \
    -d '{"text":"arm the system"}'
  ```

## Features

- 🗣️ **Natural Language Processing**: Understands commands like "arm the system", "add user John with pin 4321"
- 🤖 **LLM Integration**: Uses OpenAI GPT-4o-mini with regex fallback for offline capability
- 🔐 **Security System**: Arm/disarm in different modes (away, home, stay)
- 👥 **User Management**: Add/remove users with PINs and permissions
- 🐳 **Docker Ready**: One command deployment
- 🏥 **Health Monitoring**: Built-in health checks and structured logging

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   NLP Service   │───▶│  REST API       │
│   (Next.js)     │    │   (OpenAI +     │    │  (Express)      │
│   Port 3000     │    │    Regex)       │    │  Port 4000      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Example Commands

- `"arm the system"`
- `"please activate the alarm to stay mode"`
- `"turn off the alarm now"`
- `"add user John with pin 4321"`
- `"add a temporary user Sarah, pin 5678 from today 5pm to Sunday 10am"`
- `"remove user John"`
- `"show me all users"`
- `"My mother-in-law is coming to stay for the weekend, make sure she can arm and disarm our system using passcode 1234"`

## API Endpoints

### System Control
- `POST /api/arm-system` - Arm the system with mode (away/home/stay)
- `POST /api/disarm-system` - Disarm the system
- `GET /api/system-status` - Get current system status

### User Management
- `POST /api/add-user` - Add a new user with PIN and permissions
- `POST /api/remove-user` - Remove user by name or PIN
- `GET /api/list-users` - List all users (PINs masked)

### Natural Language
- `POST /nl/execute` - Process natural language command

### Health & Monitoring
- `GET /healthz` - Health check endpoint

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key (optional, system works with regex fallback)

### Local Development

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd alarm-app
   ```

2. **Backend**:
   ```bash
   cd apps/api
   npm install
   # Optional: Set OpenAI key for LLM features
   export OPENAI_API_KEY="your-key-here"
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd apps/client
   npm install
   npm run dev
   ```

### Docker Deployment

**Simple deployment**:
```bash
docker compose up --build
```

**With OpenAI integration**:
```bash
OPENAI_API_KEY="your-key-here" docker compose up --build
```

**Production deployment**:
```bash
docker compose -f docker-compose.yml up -d --build
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for LLM features | - | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `API_BASE` | Backend API URL | http://localhost:4000 | No |

### Docker Ports

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Frontend | 3000 | 3000 |
| Backend API | 4000 | 4000 |

## Project Structure

```
alarm-app/
├── apps/
│   ├── api/                    # Backend Express API
│   │   ├── routes/
│   │   │   ├── api.js         # System control endpoints
│   │   │   ├── user.js        # User management endpoints
│   │   │   └── nl.js          # Natural language processing
│   │   ├── services/
│   │   │   ├── llm.js         # OpenAI integration
│   │   │   └── nlp.js         # NLP with fallback
│   │   ├── utils/
│   │   │   └── helpers.js     # Utility functions
│   │   ├── state.js           # In-memory state management
│   │   ├── Dockerfile
│   │   └── package.json
│   └── client/                # Frontend Next.js app
│       ├── pages/
│       │   └── index.js       # Main UI
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
└── README.md
```

## Testing

### Manual Testing

**Test the NLP endpoint**:
```bash
curl -X POST http://localhost:4000/nl/execute \
  -H "Content-Type: application/json" \
  -d '{"text":"add user Alice with pin 1234"}'
```

**Test direct API**:
```bash
# Arm system
curl -X POST http://localhost:4000/api/arm-system \
  -H "Content-Type: application/json" \
  -d '{"mode":"away"}'

# List users
curl http://localhost:4000/api/list-users

# Health check
curl http://localhost:4000/healthz
```

### Frontend Testing

1. Open http://localhost:3000
2. Type: `"arm the system to stay mode"`
3. Click Submit
4. Verify you see:
   - Input text
   - Interpreted plan
   - API call made
   - Response from backend

## Security Features

- 🔒 **PIN Masking**: User PINs are masked in API responses
- 🛡️ **Input Validation**: Basic validation on all inputs
- 🚫 **No Logging of Secrets**: Full PINs never appear in logs
- 🔍 **Health Checks**: Built-in monitoring endpoints

## Troubleshooting

### Common Issues

**"Cannot find package 'cors'"**:
```bash
cd apps/api && npm install
```

**"Connection refused"**:
- Ensure backend is running on port 4000
- Check Docker containers: `docker compose ps`

**"LLM not working"**:
- System falls back to regex rules automatically
- Set `OPENAI_API_KEY` environment variable for full LLM features

**Docker build fails**:
```bash
docker compose down
docker compose up --build --force-recreate
```

### Logs and Debugging

**View container logs**:
```bash
docker compose logs api
docker compose logs client
```

**Check health status**:
```bash
curl http://localhost:4000/healthz
curl http://localhost:3000  # Should return HTML
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker compose up --build`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Questions?** This system is designed to be intuitive. Try natural language commands and see how they're interpreted!
