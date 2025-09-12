# Changelog

All notable changes to Context Monkey will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.2] - 2025-09-11

### Fixed

- Replace `__dirname` with `import.meta.dirname` for ES modules compatibility

## [0.10.1] - 2025-09-11

### Added

- Pre-commit hooks workflow verification
- Enhanced testing infrastructure

## [0.10.0] - 2025-09-11

### Added

- Complete TypeScript migration with comprehensive type safety
- Full ES module support throughout codebase
- Enhanced error handling and validation

### Changed

- **Breaking**: Migrated entire codebase from JavaScript to TypeScript
- Updated build process to use TypeScript compiler
- Modernized import/export syntax throughout

### Improved

- Type safety across all modules
- Development experience with better IDE support
- Code quality with comprehensive linting rules

## [0.9.0] - 2025-09-11

### Added

- Claude Code notification hooks installation and management
- Desktop notification support for macOS (via terminal-notifier)
- Confirmation prompts for installation and hook setup

### Changed

- Merged install and upgrade commands for simplified workflow
- Changed default installation to global (`~/.claude`) with `--local` flag for project-specific installs
- Enhanced user experience with interactive prompts

### Improved

- Installation process with better user feedback
- Platform-specific notification support
- Settings management and hook integration

## [0.8.1] - 2025-09-10

### Fixed

- Updated commands directory from `monkey` to `cm` for consistency

## [0.8.0] - 2025-09-10

### Changed

- **Breaking**: Renamed `.monkey/` directory to `.cm/` across entire codebase
- Updated all documentation to reflect new directory structure
- Migrated command paths and references

### Improved

- Cleaner, more professional naming convention
- Consistent branding throughout the project

## [0.7.0] - 2025-09-09

### Added

- Interactive documentation generator with delegation approach
- Comprehensive CONTRIBUTING.md guide for new developers
- Enhanced command and agent template system

### Changed

- Removed templating references and renamed templates to resources
- Fixed slash command registration by removing version template variables
- Updated agent and command template YAML frontmatter for proper Claude Code discovery

### Improved

- Better organization of resource files
- Enhanced developer onboarding documentation

## [0.6.0] - 2025-09-09

### Added

- Security assessment and dependency analysis features
- Enhanced stack profiling capabilities
- Comprehensive feature documentation

### Improved

- Command discovery and registration process
- Agent integration with Claude Code
- Overall system reliability and performance

## Earlier Versions

### [0.5.0] and below

- Initial development and core feature implementation
- Basic CLI structure and command system
- Foundation for subagent architecture

---

## Version History Summary

- **0.10.x**: TypeScript migration and ES modules
- **0.9.x**: Notification hooks and installation improvements
- **0.8.x**: Directory restructuring and naming consistency
- **0.7.x**: Documentation generator and resource organization
- **0.6.x**: Security features and enhanced profiling
- **0.5.x and below**: Initial development and core features

## Contributing

When contributing to this project, please:

1. Follow [Semantic Versioning](https://semver.org/) for version numbers
2. Update this CHANGELOG.md with your changes
3. Use conventional commit messages (feat:, fix:, docs:, etc.)
4. Test your changes thoroughly before submitting

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
