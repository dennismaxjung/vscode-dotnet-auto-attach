# Changelog

All notable changes to the "vscode-dotnet-auto-attach" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## [Unreleased]

### Added
- Added project property to DotNetAutoAttach DebugConfiguration of launch.json. The project property allow to start a specific project and let you bypass the quick pick menu.

### Changed

- Changed naming of debug process in debug panel, now includes project name of the project which the debug session belongs to.

### Deprecated

### Removed

### Fixed

- InitalConfiguration & launch.json are now generated if they were not present.

### Security

## [1.0.0] - 2018-09-25

- Initial release
