# CLAUDE.md

## Project Overview

A CLI tool for managing Amazon ECS (Elastic Container Service) services through AWS SDK APIs. The tool is built using the oclif framework and follows code quality standards enforced by Biome linting.


## Technology Stack

- **Framework**: oclif (Open CLI Framework) - Node.js CLI framework
- **AWS Integration**: aws-sdk (Amazon Web Services SDK)
- **Linting**: Biome - Fast linter and formatter for JavaScript/TypeScript
- **Runtime**: Node.js


## Architecture & Structure

### CLI Framework (oclif)

- Uses oclif's command structure with base classes and decorators
- Commands are organized in a hierarchical structure
- Supports flags, arguments, and help documentation
- Implements oclif's plugin architecture for extensibility

### AWS SDK Integration

- Utilizes AWS SDK v3 for ECS service management
- Implements proper AWS credential handling and region configuration
- Handles AWS API rate limiting and error responses
- Supports both programmatic and profile-based authentication


## Development Guidelines

### Code Quality

- **Linting**: All code must pass Biome linting rules
- **Error Handling**: Implement comprehensive error handling for AWS API calls
- **Logging**: Use consistent logging patterns for debugging and user feedback
- **Type Safety**: Leverage TypeScript for type safety with AWS SDK responses

### AWS Best Practices

- **Credential Management**: Assume the environment already has AWS credentials configured (ENV variables, AWS config files)
- **Region Handling**: Allow region specification via flags or environment variables
- **Pagination**: Handle paginated AWS API responses properly
- **Rate Limiting**: Implement backoff strategies for API throttling

### Command Design

- **Consistent Flags**: Use standard flag names across commands (--cluster, --service, --region)
- **Output Formats**: Support multiple output formats (table, JSON, YAML)
- **Confirmation**: Require confirmation for destructive operations
- **Progress Indicators**: Show progress for long-running operations

## File Structure

```
src/
├── commands/          # oclif command classes
├── utils/             # Shared utilities and AWS client setup
├── types/             # TypeScript type definitions
└── utils/             # Helper functions and formatters
```

## Configuration

- **AWS Configuration**: Respects standard AWS configuration files and environment variables
- **CLI Configuration**: May include a config file for default values and preferences
- **Environment Variables**: Supports common AWS environment variables (AWS_REGION, AWS_PROFILE, etc.)

## Common Use Cases

1. **Deployment Automation**: Update services with new task definitions
2. **Scaling Operations**: Adjust service capacity based on demand
3. **Health Monitoring**: Check service and task status
4. **Troubleshooting**: Inspect failed tasks and service events
5. **Multi-Environment Management**: Work across different AWS accounts and regions

## Dependencies

- `@oclif/core` - Core oclif framework
- `@aws-sdk/client-ecs` - AWS ECS SDK client


## Development Commands

```bash
# Install dependencies
denvig install

# Run linting
denvig lint

# Fix linting issues
denvig lint:fix

# Build the CLI
denvig build

# Test commands locally
pnpm dev [command]
```

## Error Handling Patterns

- AWS API errors should be caught and presented in user-friendly format
- Network connectivity issues should be handled gracefully
- Invalid AWS credentials should provide clear guidance
- Missing required parameters should show helpful error messages

## Testing Considerations

- Mock AWS SDK calls for unit tests
- Test error scenarios and edge cases
- Validate output formatting and user experience
